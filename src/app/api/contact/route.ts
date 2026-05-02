import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const files = formData.getAll("files") as File[];

    // Log the form data
    console.log("Contact form submission:", {
      name,
      email,
      subject,
      message,
      fileCount: files.length,
      fileNames: files.map(f => f.name)
    });

    // Send to Formspree
    const formResponse = await fetch("https://formspree.io/f/mykozlvo", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: formData
    });

    if (formResponse.ok) {
      return NextResponse.json({ success: true, message: "Form submitted successfully" });
    } else {
      const errorData = await formResponse.json();
      console.error("Formspree error:", errorData);
      return NextResponse.json({ success: false, error: "Failed to submit form" }, { status: 500 });
    }
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit form" }, { status: 500 });
  }
}
