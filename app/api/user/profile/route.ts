import { config } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(config);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!prisma) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: {
      name?: string;
      phone?: string;
      password?: string;
    } = {};

    // Validate and update name
    if (name !== undefined) {
      if (!name || typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 },
        );
      }
      updateData.name = name.trim();
    }

    // Validate and update phone
    if (phone !== undefined) {
      if (!phone || typeof phone !== "string" || phone.trim() === "") {
        return NextResponse.json(
          { error: "Phone cannot be empty" },
          { status: 400 },
        );
      }
      updateData.phone = phone.trim();
    }

    // Handle password change
    if (newPassword !== undefined) {
      // Require current password
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required" },
          { status: 400 },
        );
      }

      // Verify current password
      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 401 },
        );
      }

      // Validate new password
      if (
        !newPassword ||
        typeof newPassword !== "string" ||
        newPassword.length < 6
      ) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 },
        );
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Make sure we have something to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No data to update" }, { status: 400 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[User Profile API] PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
