import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateLocationStatusAction } from "@/app/admin/actions";
import { listAllLocations } from "@/lib/location-repository";
import { getLocationStatusMeta, getLocationTypeMeta } from "@/lib/location-types";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(value);
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const key = normalizeParam(params.key);
  const requiredKey = process.env.ADMIN_DASHBOARD_KEY;
  const isAuthorized = requiredKey ? key === requiredKey : true;

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
        <SiteHeader />
        <div className="mx-auto w-full max-w-xl px-4 py-12 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin access required</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" method="GET">
                <Input
                  type="password"
                  name="key"
                  placeholder="Enter admin key"
                  required
                />
                <Button type="submit" className="w-full">
                  Open dashboard
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const locations = await listAllLocations();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,#ddfbe8_0%,#f7f8f4_38%,#ffffff_100%)]">
      <SiteHeader />

      <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Location moderation</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const typeMeta = getLocationTypeMeta(location.type);
                  const statusMeta = getLocationStatusMeta(location.status);

                  return (
                    <TableRow key={location.id}>
                      <TableCell className="min-w-[220px]">
                        <div className="space-y-1">
                          <p className="font-medium">{location.name}</p>
                          {location.address ? (
                            <p className="text-xs text-muted-foreground">
                              {location.address}
                            </p>
                          ) : null}
                          {location.description ? (
                            <p className="text-xs text-muted-foreground">
                              {location.description}
                            </p>
                          ) : null}
                          {location.foods.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Food: {location.foods.join(", ")}
                            </p>
                          ) : null}
                          {location.tags.length > 0 ? (
                            <p className="text-xs text-muted-foreground">
                              Tags: {location.tags.join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeMeta?.tone}>{typeMeta?.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMeta?.tone}>{statusMeta?.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(location.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <form action={updateLocationStatusAction}>
                            <input type="hidden" name="adminKey" value={key} />
                            <input type="hidden" name="id" value={location.id} />
                            <input type="hidden" name="status" value="approved" />
                            <Button type="submit" size="sm" variant="secondary">
                              Approve
                            </Button>
                          </form>
                          <form action={updateLocationStatusAction}>
                            <input type="hidden" name="adminKey" value={key} />
                            <input type="hidden" name="id" value={location.id} />
                            <input type="hidden" name="status" value="rejected" />
                            <Button type="submit" size="sm" variant="outline">
                              Reject
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
