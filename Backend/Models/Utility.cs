using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; } = 0;
        public int Stock { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<SaleProduct> SaleProducts { get; set; } = new List<SaleProduct>();

    }

    public class RecentSale
    {
        public int Id { get; set; }
        public int? ProductID { get; set; }
        public Product? Product { get; set; }
    }


    public class Sale
    {
        public int Id { get; set; }
        public string? AppUserId { get; set; }
        public AppUser? AppUser { get; set; }
        public string? CustomerName { get; set; }
        public decimal GrandPrice { get; set; } =0;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ICollection<SaleProduct> SaleProducts { get; set; } = new List<SaleProduct>();

    }


    public class SaleProduct
    {
        public int SaleId { get; set; }
        public Sale? Sale { get; set; }  // Navigation property to Sale

        public int ProductId { get; set; }
        public Product? Product { get; set; }  // Navigation property to Product

        public int Quantity { get; set; }  // The quantity of each product sold

        public decimal TotalPrice {get; set;}
    }



}