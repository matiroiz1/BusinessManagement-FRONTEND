import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API funcionando",
    timestamp: new Date(),
    env: {
      backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080",
      nodeEnv: process.env.NODE_ENV,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    console.log("📝 Request body:", body);
    
    // Intenta conectar al backend
    const backendRes = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("📡 Backend response status:", backendRes.status);
    
    const data = await backendRes.json();
    console.log("📦 Backend response body:", data);

    return NextResponse.json({
      success: true,
      backendStatus: backendRes.status,
      backendData: data,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
