
using BackendProjekt.Model;
using BackendProjekt.Auth;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.CompilerServices;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

namespace BackendProjekt
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var connectionString = builder.Configuration.GetConnectionString("brckett");
            if (connectionString == null) {
                Console.WriteLine("Adatbázis kapcsolat sztring nem található!");
                return;
            }

            // Add services to the container.
            builder.Services.AddDbContext<Context>(builder =>
            {
                builder.UseMySQL(connectionString);
            });


            // A token alapú azonosításhoz és jogosultság-kezeléshez szükséges beállításokat a könnyebb átláthatóság kedvéért
            // egy külön metódus végzi el.
            AddJwtAuthentication(builder);


            builder.Services.AddControllers()
                .AddJsonOptions(o =>
                {
                    o.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
                    o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            // Az alábbi middleware hibakeresésnél lehet hasznos. A bejövõ kérésbõl kiolvassa és kiírja az
            // Authorization fejlécet, ami a tokent tartalmazza.
            app.Use((context, next) =>
            {
                var auth = context.Request.Headers.Authorization;
                app.Logger.LogDebug($"*** Authorization: {auth}");
                return next();
            });

            // Nagyon fontos a következõ két middleware helyes sorrendje, ha azonosítást (hitelesítés) használunk és jogosultságokat
            // kezelünk. Az Authentication feladata a konfigurált azonosítás alapján a kérés (Request) objektumból kinyerni az információkat
            // pl. a kliensrõl tett állításokat (claims), és ezeket eltárolja a további feldolgozás számára.
            app.UseAuthentication();
            // Csak ezután lehet sikeres a jogosultságok kezelése, hiszen ehhez szükség van a azonosított vagy hitelesített kliensre és annak
            // jogosultságaira. Ebben a példában a jogosultságokhoz "permission" elnevezésû Claim objektumokat hoztunk létre, melyeket a token
            // tárol (lásd GenerateToken).
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }

















        private static void AddJwtAuthentication(WebApplicationBuilder builder)
        {
            // A token ellenõrzéséhez (verification) szükség van az alábbi három adatra, melyeket ebben a projektben az appsettings.json tartalmaz.
            // Ezekeket az adatok más módon is lehet tárolni, adatbázisban, külön fájlban, esetleg a forráskódban (nem ajánlott).
            // A kulcs szükséges az aláírás érvényességének ellenõrzéséhez.
            var secretKey = builder.Configuration["Auth:Jwt:Key"];
            // A token kibocsátója és a célközönség egyedibbé és biztonságosabbá teszi a tokent, lehetõséget ad arra is, hogy egy API-n belül a klienseket
            // megkülönböztethessük, pl. bizonyos végpontok csak a megfelelõ célközönség számára lehetnek elérhetõek.
            var issuer = builder.Configuration["Auth:Jwt:Issuer"];
            var audience = builder.Configuration["Auth:Jwt:Audience"];
            // Ha bármelyik adat hiányzik, akkor nem tudjuk a tokeneket kezelni. 
            if (string.IsNullOrEmpty(secretKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
            {
                throw new ApplicationException("Authentication konfiguráció hiányzik");
            }

            // A TokenManagert mint egyedi szolgáltatást regisztráljuk, így az API-n belül bárhonnan elérhetõvé válik. A LoginController használja, amikor
            // tokent kell generálnia a hitelesített kliens számára.
            var tokenManager = new TokenManager(builder.Configuration);
            builder.Services.AddSingleton(tokenManager);

            // Authentication - az API JsonWebToken típusú tokent használ, amely magában hordozza a kliens azonosítóit és jogosultságait, melyeket automatikusan
            // ellenõriz a keretrendszer az olyan bejövõ kéréseknál, melyek védett végpontokat céloznak.
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        // Ellenõrzi a kibocsátót
                        ValidateIssuer = true,
                        // a célközönséget
                        ValidateAudience = true,
                        // a token élettartamát (lejáratát)
                        ValidateLifetime = true,
                        // és az aláírását.
                        ValidateIssuerSigningKey = true,
                        // Ehhez kell a kibocsátó,
                        ValidIssuer = issuer,
                        // a célközönség
                        ValidAudience = audience,
                        // és a titkos kulcs.
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                    };

                    // A token érvénytelenítéséhez bele kell nyúlnunk a token ellenõrzésének folyamatába.
                    options.Events = new JwtBearerEvents
                    {
                        // A token automatikus ellenõrzése utána mi is megvizsgálhatjuk a tokent. 
                        OnTokenValidated = async context =>
                        {
                            // A token tárolja a felhasználó email címét.
                            var email = context.Principal?.FindFirst(ClaimTypes.Name)?.Value;
                            if (!string.IsNullOrEmpty(email))
                            {
                                // Szükség lesz az adatbázisra a felhasználó lekérdezéséhez.
                                var dbContext = context.HttpContext.RequestServices.GetService<Context>() ??
                                                throw new ApplicationException("Kritikus hiba: Db kontextus nem elérhetõ!");
                                // Lekérdezzük a felhasználót, hogy az aktuális tokenjét kiolvashassuk.
                                var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == email);
                                // Ha a felhasználó létezik
                                if (user != null)
                                {
                                    // és van eltárolt tokenje (nem jelentkezett ki)
                                    if (user.Token != null)
                                    {
                                        // akkor az eltárolt token alapján két eset lehetséges:
                                        var token = (context.SecurityToken as JsonWebToken)?.EncodedToken;
                                        if (user.Token != token)
                                        {
                                            // 1. Az eltárolttoken eltér az aktuálistól
                                            // Ez azt jelenti, hogy a felhasználó kijelentkezés nélkül
                                            // újra bejelentkezett, tehát új munkamenetet indított.
                                            // Az eltárolt tokent aktualizálni kell.
                                            user.Token = token;
                                            await dbContext.SaveChangesAsync();
                                        }
                                        // 2. Az eltárolt token megegyezik az aktuálissal
                                        // Ebben az esetben a felhasználó az aktív munkamenetben van.
                                        return;
                                    }
                                }
                            }
                            context.Fail("Unauthorized");
                        }
                    };
                });

            // Authorization - ez az API a szabályzás (policy) alapú jogosultság kezelést használja.
            builder.Services.AddAuthorization(options =>
            {
                // Minden jogosultságot Policy formában átadjuk az Authorization middleware számára. A jogosultságokat a TokenManager tárolja, melyeket a
                // konfigurációból (appsettings.json) olvasott ki.
                foreach (var permission in tokenManager.Permissions)
                {
                    // A szabáy meve a jogosultság neve, a szabályt kielégítõ állítás (claim) kulcs "permission" értéke pedig szintén a jogosultság neve.
                    options.AddPolicy(permission, policy => policy.RequireClaim("permission", permission));
                }
            });

            // Ahhoz, hogy a Swagger is használja a tokent, be kell állítanunk pár dolgot. 
            builder.Services.AddSwaggerGen(
                options =>
                {
                    // A biztonsági séma hordozó JWT token, mely az Authorization fejlécben helyezkedik el.
                    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                    {
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.Http,
                        Scheme = "Bearer",
                        BearerFormat = "JWT"
                    });

                    options.AddSecurityRequirement(new OpenApiSecurityRequirement
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                }
                            },
                            Array.Empty<string>()
                        }
                    });
                });
        }
    }
}
