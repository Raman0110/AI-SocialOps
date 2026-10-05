using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocialOps.Api.Shared.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddMessageExternalMessageIdUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_messages_ExternalMessageId",
                table: "messages",
                column: "ExternalMessageId",
                unique: true,
                filter: "\"ExternalMessageId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_messages_ExternalMessageId",
                table: "messages");
        }
    }
}
