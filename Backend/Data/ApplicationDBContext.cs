using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class ApplicationDBContext : IdentityDbContext<AppUser>
    {
        public ApplicationDBContext(DbContextOptions dbContextOptions)
        : base (dbContextOptions)
        {
            
        }

        public DbSet<Otp> Otps { get; set; }
        public DbSet<RecentSale> RecentSales { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<SaleProduct> SaleProducts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<AppUser>()
                .HasOne(a => a.Otp)
                .WithOne(o => o.AppUser)
                .HasForeignKey<Otp>(o => o.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure SaleProduct as a junction table
            modelBuilder.Entity<SaleProduct>()
                .HasKey(sp => new { sp.SaleId, sp.ProductId });

            modelBuilder.Entity<SaleProduct>()
                .HasOne(sp => sp.Sale)
                .WithMany(s => s.SaleProducts)
                .HasForeignKey(sp => sp.SaleId);

            modelBuilder.Entity<SaleProduct>()
                .HasOne(sp => sp.Product)
                .WithMany(p => p.SaleProducts)
                .HasForeignKey(sp => sp.ProductId);



            List<IdentityRole> roles = new List<IdentityRole>{
                new IdentityRole{
                    Name = "Admin",
                    NormalizedName = "ADMIN"
                },
                new IdentityRole{
                    Name = "Sales",
                    NormalizedName = "SALES"
                }
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);

        }
    }
}