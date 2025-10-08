import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench } from "lucide-react";

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Assets</h1>
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4">
            <Wrench className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Asset Management Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The full functionality for managing assets, including adding, editing, and tracking maintenance history, is currently under development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
