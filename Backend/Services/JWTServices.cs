using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services
{
    public class JWTServices : IJWTService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _key;
        public readonly ApplicationDBContext _context;
        public JWTServices(
            IConfiguration config,
            ApplicationDBContext context
            )
        {
            _context = context;
            _config = config;
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
        }


        public string CreateJwtTokenAsync(AppUser appUser)
        {
            var claims = new List<Claim>{
                new Claim(ClaimTypes.NameIdentifier, appUser.Id),
                new Claim("IsSales", appUser.IsSales.ToString()), 
                new Claim("IsAdmin", appUser.IsAdmin.ToString()),
                // new Claim(JwtRegisteredClaimNames.GivenName, appUser.UserName),
                // new Claim (JwtRegisteredClaimNames.Email, appUser.Email)
            };
            // var userRoles = await userManager.GetRolesAsync(appUser);
            // foreach (var role in userRoles)
            // {
            //     claims.Add(new Claim(ClaimTypes.Role, role));
            // }
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor{
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(60),
                NotBefore = DateTime.UtcNow,
                SigningCredentials = creds,
                Issuer = _config["JWT:Issuer"],
                Audience = _config["JWT:Audience"]

            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public int GenerateToken()
        {
            Random random = new Random();
            return random.Next(100000, 1000000);
        }

        public string RandomPassword()
        {
            Random random = new Random();
            char capitalLetter = (char)random.Next('A', 'Z' + 1);
            char digit = (char)random.Next('0', '9' + 1);
            char[] lowercaseLetters = new char[6];
            for (int i = 0; i < lowercaseLetters.Length; i++)
            {
                lowercaseLetters[i] = (char)random.Next('a', 'z' + 1);
            }
            string password = capitalLetter.ToString() + digit + new string(lowercaseLetters);
            return new string(password.OrderBy(c => random.Next()).ToArray());
        }




        
    }
}