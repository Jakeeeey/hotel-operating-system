"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
    value?: string;
    onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [preview, setPreview] = useState<string | null>(value || null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                onChange(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
                    isDragging ? "border-primary bg-primary/10" : "border-muted-foreground/25"
                } ${preview ? "hidden" : "block"}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64 = reader.result as string;
                            setPreview(base64);
                            onChange(base64);
                        };
                        reader.readAsDataURL(file);
                    }
                }}
            >
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                    Drag & drop an image here, or click to select
                </p>
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    type="button"
                    variant="secondary"
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                >
                    Select File
                </Button>
            </div>

            {preview && (
                <div className="relative rounded-lg overflow-hidden border aspect-video max-w-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={preview}
                        alt="Room Preview"
                        className="object-cover w-full h-full"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
