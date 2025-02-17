using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Helpers
{
    public class ProductQuery
    {
        public string? Name { get; set; }
        public string? Availability { get; set; }
        public DateTime DateMin { get; set; }
        public DateTime DateMax { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class IndexProductQuery
    {
        public string? Name { get; set; }

    }

    public class SaleProductQuery
    {
        public string? Name { get; set; }
        public string? Availability { get; set; }
        public DateTime DateMin { get; set; }
        public DateTime DateMax { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }


    public class SalesProductQuery
    {
        public string? ProductName { get; set; }
        public string? SalesAgent { get; set; }
        public string? CustomerName { get; set; }
        public DateTime DateMin { get; set; }
        public DateTime DateMax { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        
    }   

    public class UserSalesQuery
    {
        public DateTime DateMin { get; set; }
        public DateTime DateMax { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }


}