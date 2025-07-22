using Microsoft.EntityFrameworkCore;
using OPMarketplace.Models;

namespace OPMarketplace.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Card> Cards { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Listing> Listings { get; set; } = null!;
        public DbSet<CardColor> CardColors { get; set; } = null!;
        public DbSet<CardColorJunction> CardColorJunctions { get; set; } = null!;
        public DbSet<CardCondition> CardConditions { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Унікальні ключі
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<CardColorJunction>()
                .HasIndex(ccj => new { ccj.ProductId, ccj.ColorCode })
                .IsUnique();

            // Зв'язки
            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Card)
                .WithMany(c => c.Listings)
                .HasForeignKey(l => l.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Listing>()
                .HasOne(l => l.Seller)
                .WithMany(u => u.Listings)
                .HasForeignKey(l => l.SellerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CardColorJunction>()
                .HasOne(ccj => ccj.Card)
                .WithMany(c => c.CardColors)
                .HasForeignKey(ccj => ccj.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CardColorJunction>()
                .HasOne(ccj => ccj.CardColor)
                .WithMany(cc => cc.CardColorJunctions)
                .HasForeignKey(ccj => ccj.ColorCode)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
