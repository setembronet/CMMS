import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export default function WorkOrdersPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold font-headline">Work Orders</h1>
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <CardHeader>
          <div className="mx-auto bg-muted rounded-full p-4">
            <ClipboardList className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="mt-4">Work Order Management Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The module for creating, assigning, and tracking work orders is being built. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
