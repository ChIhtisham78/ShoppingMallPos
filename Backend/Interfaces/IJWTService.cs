using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;

namespace Backend.Interfaces
{
    public interface IJWTService
    {
        string? CreateJwtTokenAsync (AppUser appUser);
        int GenerateToken();
        string RandomPassword();
    }
}