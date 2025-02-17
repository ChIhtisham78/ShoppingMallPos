using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Dtos
{
    public class CreateAdminDto
    {
        [Required]
        public string? Username { get; set; }
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? SecurityQuestion { get; set; }
        [Required]
        public string? SecurityAnswer { get; set; }

        [Required]
        public string? Password { get; set; }

    }

     public class UserLoginDto
    {
        [Required]
        public string? Username { get; set; }
        [Required]
        public string? Password { get; set; }

    }

    public class ForgotPasswordDto
    {
        [Required]
        public string? Username { get; set; }
        [Required]
        public string? Question { get; set; }
        [Required]
        public string? Answer { get; set; }

    }

    public class VerifyOtpDto
    {
        [Required]
        public string? Username { get; set; }
        public int Token { get; set; }

    }

    public class ChangePasswordDto
    {
        [Required]
        public string? OldPassword { get; set; }
        [Required]
        public string? Password1 { get; set; }
        [Required]
        public string? Password2 { get; set; }
    }

    public class CreateSalesDto
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        public string? UserName { get; set; }
        [Required]
        public string? Question { get; set; }
        [Required]
        public string? Answer { get; set; }
    }














}