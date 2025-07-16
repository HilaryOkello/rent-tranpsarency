import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rents = await prisma.rentEntry.findMany();
    return NextResponse.json(rents);
  } catch (error) {
    console.error("Error fetching rents:", error);
    return NextResponse.json(
      { error: "Failed to fetch rents" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRentEntry = await prisma.rentEntry.create({
      data: body,
    });
    return NextResponse.json(newRentEntry, { status: 201 });
  } catch (error) {
    console.error("Error creating rent entry:", error);
    return NextResponse.json(
      { error: "Failed to create rent entry" },
      { status: 500 }
    );
  }
}
