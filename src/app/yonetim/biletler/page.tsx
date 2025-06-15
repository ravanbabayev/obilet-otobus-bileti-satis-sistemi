"use client";

import Link from "next/link";
import { 
  CreditCard, 
  ArrowLeft, 
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BiletYonetimi() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/yonetim">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Yönetim Paneli
                </Button>
              </Link>
              <CreditCard className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Bilet Yönetimi</h1>
                <p className="text-sm text-gray-500">Satılan biletleri görüntüle ve yönet</p>
              </div>
            </div>
            
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Bilet
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Bilet Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Bilet yönetimi sayfası hazırlanıyor...</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 