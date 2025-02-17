using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Backend.Dtos;
using Backend.Models;

namespace Backend.Mappers
{
    public static class AdminMapper
    {
        public static ListProductsDto ToListProductsDto(this Product product)
        {
            return new ListProductsDto
            {
                Id = product.Id,
                Name = product.Name,
                CreatedAt = product.CreatedAt,
                Price = product.Price,
                Stock = product.Stock,
            };
        }


        public static ListRecentSaleDto ToListRecentSaleDto(this RecentSale recentSale)
        {
            return new ListRecentSaleDto
            {
                Id = recentSale.Id,
                ProductName = recentSale.Product?.Name,
                ProductStock = recentSale.Product?.Stock,
                ProductId = recentSale.Product?.Id,
                ProductPrice = recentSale.Product?.Price
            };
        }

        public static ListSalesDto ToListSalesDto(this Sale sale){
            return new ListSalesDto{
                Id = sale.Id,
                SalesAgent = sale.AppUser?.Name,
                CustomerName = sale.CustomerName,
                TotalPrice = sale.GrandPrice,
                CreatedAt = sale.CreatedAt
            };
        }

        public static UserDto ToUserDto(this AppUser appUser){
            return new UserDto{
                Id = appUser.Id,
                Name = appUser.Name,
                Username = appUser.UserName
                
            };
        }


        public static SalesProductListDto ToSalesProductListDto(this SaleProduct saleProduct){
            return new SalesProductListDto{
                Quality = saleProduct.Quantity,
                ProductName = saleProduct.Product?.Name,
                ProductStock = saleProduct.Product?.Stock,
                ProductId = saleProduct.Product?.Id,
                ProductPrice= saleProduct.Product?.Price,
                TotalPrice = saleProduct.TotalPrice
            };
        }




        public static SalesProductDetailsDto ToSalesProductDetailsDto(this Sale sale){
            return new SalesProductDetailsDto{
                Id = sale.Id,
                SalesAgent = sale.AppUser?.Name,
                CustomerName = sale.CustomerName,
                TotalPrice = sale.GrandPrice,
                CreatedAt = sale.CreatedAt,
                SalesProduct = sale.SaleProducts.Select(x=>x.ToSalesProductListDto()).ToList()
            };
        }



        




    }
}