using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;


namespace Backend.Dtos
{

    public class CreateProductDto
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        public decimal Price { get; set; }
        [Required]
        public int Stock { get; set; }
    }

    public class ListProductsDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateProductsDto
    {
        [Required]
        public string? Name { get; set; }
        [Required]
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }

    public class ListSalesDto
    {
        public int Id { get; set; }
        public string? SalesAgent { get; set; }
        public string? CustomerName { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ListRecentSaleDto
    {
        public int Id { get; set; }
        public string? ProductName { get; set; }
        public int? ProductStock { get; set; }
        public int? ProductId { get; set; }
        public decimal? ProductPrice { get; set; }
    }


    public class CreateSaleDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class UserDto
    {
        public string? Id { get; set; }
        public string? Name { get; set; }
        public string? Username { get; set; }
    }


    public class SalesProductListDto
    {
        // public int Id { get; set; }
        public int Quality { get; set; }
        public string? ProductName { get; set; }
        public int? ProductStock { get; set; }
        public int? ProductId { get; set; }
        public decimal? ProductPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        
    }

    public class SalesProductDetailsDto
    {
        public int Id { get; set; }
        public string? SalesAgent { get; set; }
        public string? CustomerName { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<SalesProductListDto>? SalesProduct {get; set;} = new List<SalesProductListDto>();
    }


    public class UserSalesProfileDto
    {
        public int SaleId { get; set; }
        public string? AppUserId { get; set; }
        public List<SalesProductListDto>? Products {get; set;} = new List<SalesProductListDto>();
       
    }






}