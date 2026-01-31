import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import fs from "fs";
import path from "path";

// POST - Upload vendor logo
export const POST = requireRole("VENDOR")(
    async (request: NextRequest, { user }: any) => {
        try {
            const body = await request.json();
            const { image, filename } = body;

            if (!image || !filename) {
                return NextResponse.json(
                    { error: "Image and filename are required" },
                    { status: 400 }
                );
            }

            // Validate base64 image
            const matches = image.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
            if (!matches) {
                return NextResponse.json(
                    { error: "Invalid image format. Must be base64 encoded PNG, JPG, GIF, or WebP" },
                    { status: 400 }
                );
            }

            const extension = matches[1];
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');

            // Validate file size (max 2MB)
            if (buffer.length > 2 * 1024 * 1024) {
                return NextResponse.json(
                    { error: "Image size must be less than 2MB" },
                    { status: 400 }
                );
            }

            // Create uploads directory if it doesn't exist
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'logos');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Generate unique filename
            const uniqueFilename = `${user.vendorProfile.id}_${Date.now()}.${extension}`;
            const filePath = path.join(uploadsDir, uniqueFilename);

            // Delete old logo if exists
            const existingProfile = await prisma.vendorProfile.findUnique({
                where: { id: user.vendorProfile.id },
                select: { logoUrl: true }
            });

            if (existingProfile?.logoUrl) {
                const oldFilename = existingProfile.logoUrl.split('/').pop();
                if (oldFilename) {
                    const oldPath = path.join(uploadsDir, oldFilename);
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                }
            }

            // Save new logo
            fs.writeFileSync(filePath, buffer);

            // Update vendor profile with logo URL
            const logoUrl = `/uploads/logos/${uniqueFilename}`;
            await prisma.vendorProfile.update({
                where: { id: user.vendorProfile.id },
                data: { logoUrl }
            });

            return NextResponse.json({
                success: true,
                logoUrl,
                message: "Logo uploaded successfully"
            });

        } catch (error: any) {
            console.error("Logo upload error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to upload logo" },
                { status: 500 }
            );
        }
    }
);

// GET - Get current vendor logo
export const GET = requireRole("VENDOR")(
    async (request: NextRequest, { user }: any) => {
        try {
            const profile = await prisma.vendorProfile.findUnique({
                where: { id: user.vendorProfile.id },
                select: { logoUrl: true, companyName: true }
            });

            return NextResponse.json({
                success: true,
                logoUrl: profile?.logoUrl || null,
                companyName: profile?.companyName || ''
            });

        } catch (error: any) {
            console.error("Get logo error:", error);
            return NextResponse.json(
                { error: error.message || "Failed to get logo" },
                { status: 500 }
            );
        }
    }
);
