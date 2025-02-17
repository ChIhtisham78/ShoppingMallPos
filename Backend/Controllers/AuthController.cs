using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Backend.Data;
using Backend.Dtos;
using Backend.Interfaces;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace Backend.Controllers
{
    [Route("auth/api/")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        public readonly ApplicationDBContext _context;
        public readonly UserManager<AppUser> _userManager;
        public readonly SignInManager<AppUser> _signInManager;
        public readonly IJWTService _token;
        public AuthController(
            ApplicationDBContext context,
            SignInManager<AppUser> signInManager,
            UserManager<AppUser> userManager,
            IJWTService token

        )
        {
            _context = context;
            _signInManager = signInManager;
            _userManager = userManager;
            _token = token;
        }

        [HttpPost("create/admin")]
        public async Task<IActionResult> CreateAdminEP([FromBody] CreateAdminDto adminDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new {message=ModelState});
            }
            try{
                var user = new AppUser{
                UserName = adminDto.Username,
                Name = adminDto.Name,
                IsAdmin = true,
                IsSales = false
            };
            var userModel = await _userManager.CreateAsync(user, adminDto.Password);
              if (userModel.Succeeded){
                var role = await _userManager.AddToRoleAsync(user, "Admin");
                if (role.Succeeded){
                    var otp = new Otp{
                        AppUserId = user.Id,
                        Question = adminDto.SecurityQuestion,
                        Answer= adminDto.SecurityAnswer,
                        Token = _token.GenerateToken()
                    };
                    await _context.Otps.AddAsync(otp);
                    await _context.SaveChangesAsync();
                    return StatusCode(201, new {message = $"Admin Account Successfully Created for {adminDto.Username}"});
                }else{return StatusCode(500, new {message = role.Errors});}
                
              }else{return StatusCode(500, new {message = userModel.Errors});
              }
            }catch(Exception e){
                return StatusCode(400, new{message = e});
            }
            
        }

        [HttpPost("user/login")]
        public async Task<IActionResult> UserLogin([FromBody] UserLoginDto loginDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new {message=ModelState});
            }
            var user = await _userManager.Users.FirstOrDefaultAsync(x=> x.UserName == loginDto.Username);
            if (user == null){
                return StatusCode(400, new { message = "incorrect credentials"});
            }else{
                var loginUser = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);
                if (!loginUser.Succeeded){
                    return StatusCode(400, new { message = "incorrect credentials"});
                }else{
                    // var action = $"LoggedIn";
                    // var name = $"{user.FirstName} {user.LastName}";
                    // await _userRepo.CreateAuditAsync(name, action);
                    return StatusCode (200,new {
                    message = "login successfully",
                    name = user.Name,
                    isAdmin = user.IsAdmin,
                    isSales = user.IsSales,
                    username = user.UserName,
                    token = _token.CreateJwtTokenAsync(user),
                });
                }
            }
        }

        [HttpPost("forgot/password/")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new {message=ModelState});
            }
            var user = await _userManager.Users.FirstOrDefaultAsync(x=> x.UserName == forgotPasswordDto.Username);
            if (user == null){
                return StatusCode(400, new { message = $"No account found for {forgotPasswordDto.Username}"});
            }
            var exisitingOtp = await _context.Otps.FirstOrDefaultAsync(x=> x.AppUserId == user.Id
                        && x.Question == forgotPasswordDto.Question && x.Answer == forgotPasswordDto.Answer);
            if (exisitingOtp == null){
                return StatusCode(400, new { message = $"Answer is Incorrect"});
            }else{
                exisitingOtp.Token = _token.GenerateToken();
                exisitingOtp.CreatedAt = DateTime.Now;
                exisitingOtp.IsActive = true;
                await _context.SaveChangesAsync();
                Console.WriteLine($"Token is {exisitingOtp.Token}");
                return StatusCode(200, new{message = $"Otp has been sent and here is your otp {exisitingOtp.Token}",username = user.UserName});
            }

        }

        [HttpPost("verify/otp/")]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDto verifyOtpDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new{message=ModelState});
            }
             var userModel = await _userManager.Users.FirstOrDefaultAsync(x=> x.UserName == verifyOtpDto.Username);
            if (userModel == null){
                return StatusCode(400, new{message = "Username Not Found"});
            }
            var getotp = await _context.Otps.FirstOrDefaultAsync(x=>x.Token == verifyOtpDto.Token && x.AppUser.Id == userModel.Id);
            if (getotp == null){
                return StatusCode(400, new{message = "Otp is not correct"});
            }else if (getotp.IsActive == false){
                return StatusCode(400, new{message = "Otp is has been used"});
            }else if (getotp.CreatedAt.AddMinutes(10) <= DateTime.Now ){
                getotp.IsActive = false;
                getotp.CreatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return StatusCode(400, new {message = "token has expired"});
            }
            else{
                getotp.IsActive = false;
                getotp.CreatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                string resetToken = await _userManager.GeneratePasswordResetTokenAsync(userModel);
                string newPassword = _token.RandomPassword();
                IdentityResult result = await _userManager.ResetPasswordAsync(userModel, resetToken, newPassword);
                if (result.Succeeded){
                    Console.WriteLine($"new password: {newPassword}");
                    return StatusCode(200, new{message=$"your password has been reset, here is your new password {newPassword}"});
                }
                return StatusCode(400, new {message=result.Errors});               
            }

        }

        [HttpPost("change/password/")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto passwordDto){
            if (!ModelState.IsValid){
                return StatusCode(400, new{message=ModelState});
            }
            if (passwordDto.Password1 != passwordDto.Password2){
                return StatusCode(400, new{message="password mismatch"});
            }
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return StatusCode(401,  new{message="Authorized Access"});
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return StatusCode(404,  new { message = "User not found" });
            }
            var result = await _userManager.ChangePasswordAsync(user, passwordDto.OldPassword, passwordDto.Password1);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToArray();
                return StatusCode(400, new { message = "Password change failed", errors });
            }
            // var action = $"Change Password";
            // var name = $"{user.FirstName} {user.LastName}";
            // await _userRepo.CreateAuditAsync(name, action);
            return StatusCode(200, new { message = "Password changed successfully" });
        }

        [HttpGet("get/user/data/")]
        [Authorize]
        public async Task<IActionResult> GetUserDetails(){
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) 
            {
                return StatusCode(401,  new{message="Authorized Access"});
            }
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return StatusCode(404,  new { message = "User not found" });
            }
            return StatusCode(200, new{
                isAdmin = user.IsAdmin,
                isSales = user.IsSales,
                name = user.Name,
                username = user.UserName,
                });
        }

        [HttpGet("get/username/{username}")]
        public async Task<IActionResult> GetUsername([FromRoute] string username)
        {
            var Username = await _userManager.Users.FirstOrDefaultAsync(x=>x.UserName == username);
            {
                if (Username == null){
                    return StatusCode(400, new{message="UserName not Found"});
                };
            }
            var otp = await _context.Otps.FirstOrDefaultAsync(x=>x.AppUser.UserName == Username.UserName);
            
            return StatusCode(200, new{message=otp?.Question});
            
        }
    }
}