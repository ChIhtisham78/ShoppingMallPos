using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Backend.Models
{
    public class AppUser: IdentityUser
    {
        public string? Name { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsAdmin { get; set; } = false;
        public bool IsSales { get; set; } = false;



        public int? OtpId { get; set; }
        public Otp? Otp { get; set; }
    }

    public class Otp
    {
        public int Id { get; set; }
        public int Token { get; set; }
        public string? Question { get; set; }
        public String? Answer { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public bool IsActive { get; set; } = true;
        public string? AppUserId { get; set; }
        public AppUser? AppUser { get; set; }
    }

}