using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SocialOps.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSocialIdentityToConversation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_conversations_SocialAccountId",
                table: "conversations");

            migrationBuilder.AddColumn<Guid>(
                name: "SocialIdentityId",
                table: "conversations",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SocialAccountId_SocialIdentityId_ExternalConv~",
                table: "conversations",
                columns: new[] { "SocialAccountId", "SocialIdentityId", "ExternalConversationId" });

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SocialIdentityId",
                table: "conversations",
                column: "SocialIdentityId");

            migrationBuilder.AddForeignKey(
                name: "FK_conversations_social_identities_SocialIdentityId",
                table: "conversations",
                column: "SocialIdentityId",
                principalTable: "social_identities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_conversations_social_identities_SocialIdentityId",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_SocialAccountId_SocialIdentityId_ExternalConv~",
                table: "conversations");

            migrationBuilder.DropIndex(
                name: "IX_conversations_SocialIdentityId",
                table: "conversations");

            migrationBuilder.DropColumn(
                name: "SocialIdentityId",
                table: "conversations");

            migrationBuilder.CreateIndex(
                name: "IX_conversations_SocialAccountId",
                table: "conversations",
                column: "SocialAccountId");
        }
    }
}
