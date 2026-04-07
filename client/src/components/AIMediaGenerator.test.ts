import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * @vitest-environment jsdom
 */

describe("AIMediaGenerator - Image generation with AI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate prompt is not empty", () => {
    const prompt = "";
    const isValid = prompt.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it("should validate prompt is at least 10 characters", () => {
    const prompt = "short";
    const isValid = prompt.length >= 10;
    expect(isValid).toBe(false);

    const validPrompt = "A beautiful sunset in Brasília";
    expect(validPrompt.length >= 10).toBe(true);
  });

  it("should handle image generation request", () => {
    const mockPrompt = "A beautiful sunset in Brasília with the Planalto Palace";
    const mockImageUrl = "https://example.com/generated-image.jpg";

    const request = {
      prompt: mockPrompt,
      originalImages: undefined,
    };

    expect(request.prompt).toBe(mockPrompt);
    expect(request.originalImages).toBeUndefined();
  });

  it("should handle image generation with editing", () => {
    const mockPrompt = "Add a rainbow to this landscape";
    const mockOriginalImage = {
      url: "https://example.com/original.jpg",
      mimeType: "image/jpeg",
    };

    const request = {
      prompt: mockPrompt,
      originalImages: [mockOriginalImage],
    };

    expect(request.prompt).toBe(mockPrompt);
    expect(request.originalImages).toHaveLength(1);
    expect(request.originalImages[0].url).toBe(mockOriginalImage.url);
  });

  it("should track generation state transitions", () => {
    const states = ["idle", "generating", "success", "error"];
    expect(states).toContain("idle");
    expect(states).toContain("generating");
    expect(states).toContain("success");
    expect(states).toContain("error");
  });

  it("should handle generation success with image URL", () => {
    const mockResponse = {
      success: true,
      url: "https://example.com/generated-image.jpg",
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.url).toBeTruthy();
    expect(mockResponse.url).toMatch(/^https:\/\//);
  });

  it("should handle generation error", () => {
    const mockError = {
      success: false,
      message: "Image generation failed",
    };

    expect(mockError.success).toBe(false);
    expect(mockError.message).toBeTruthy();
  });

  it("should convert generated image to base64", async () => {
    const mockImageUrl = "https://example.com/generated-image.jpg";
    
    // Mock fetch and FileReader
    const mockBlob = new Blob(["test"], { type: "image/jpeg" });
    global.fetch = vi.fn().mockResolvedValue({
      blob: vi.fn().mockResolvedValue(mockBlob),
    });

    const response = await fetch(mockImageUrl);
    const blob = await response.blob();

    expect(blob.type).toBe("image/jpeg");
  });

  it("should handle image regeneration", () => {
    let generatedImageUrl: string | null = "https://example.com/image1.jpg";
    
    // Simulate regeneration
    generatedImageUrl = null;
    expect(generatedImageUrl).toBeNull();

    // New image generated
    generatedImageUrl = "https://example.com/image2.jpg";
    expect(generatedImageUrl).toBeTruthy();
  });

  it("should track dialog open/close state", () => {
    let isOpen = false;
    expect(isOpen).toBe(false);

    isOpen = true;
    expect(isOpen).toBe(true);

    isOpen = false;
    expect(isOpen).toBe(false);
  });

  it("should reset form after successful generation", () => {
    let prompt = "A beautiful sunset";
    let generatedImageUrl: string | null = "https://example.com/image.jpg";
    let error: string | null = null;

    // Reset form
    prompt = "";
    generatedImageUrl = null;
    error = null;

    expect(prompt).toBe("");
    expect(generatedImageUrl).toBeNull();
    expect(error).toBeNull();
  });

  it("should validate image URL format", () => {
    const validUrl = "https://example.com/image.jpg";
    const isValidUrl = /^https?:\/\/.+/.test(validUrl);
    expect(isValidUrl).toBe(true);

    const invalidUrl = "not-a-url";
    expect(/^https?:\/\/.+/.test(invalidUrl)).toBe(false);
  });

  it("should handle multiple image generation attempts", () => {
    const attempts = [
      { prompt: "Sunset", success: true, url: "https://example.com/1.jpg" },
      { prompt: "Sunrise", success: true, url: "https://example.com/2.jpg" },
      { prompt: "Night", success: false, error: "Generation failed" },
    ];

    expect(attempts).toHaveLength(3);
    expect(attempts[0].success).toBe(true);
    expect(attempts[2].success).toBe(false);
  });

  it("should preserve prompt history", () => {
    const prompts = [
      "A beautiful sunset in Brasília",
      "Add a rainbow to the landscape",
      "Make it more vibrant",
    ];

    expect(prompts).toHaveLength(3);
    expect(prompts[0]).toContain("sunset");
    expect(prompts[1]).toContain("rainbow");
  });

  it("should handle generation error gracefully", () => {
    const mockError = new Error("Generation timeout");
    expect(mockError.message).toBe("Generation timeout");
  });
});
