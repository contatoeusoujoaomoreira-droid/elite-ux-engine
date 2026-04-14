import { useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface UTMSourceTableProps {
  trafficData: any[];
}

const PAGE_SIZE = 10;

const UTMSourceTable = ({ trafficData }: UTMSourceTableProps) => {
  const [sortKey, setSortKey] = useState<string>("count");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);

  // Aggregate by source
  const sourceMap: Record<string, { source: string; campaign: string; medium: string; count: number }> = {};
  trafficData.forEach((row) => {
    const source = row.utm_source || "Direto";
    const campaign = row.utm_campaign || "—";
    const medium = row.utm_medium || "—";
    const key = `${source}|${campaign}|${medium}`;
    if (!sourceMap[key]) sourceMap[key] = { source, campaign, medium, count: 0 };
    sourceMap[key].count++;
  });

  const aggregated = Object.values(sourceMap).sort((a, b) => {
    const aVal = sortKey === "count" ? a.count : a[sortKey as keyof typeof a];
    const bVal = sortKey === "count" ? b.count : b[sortKey as keyof typeof b];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    }
    return sortDir === "desc"
      ? String(bVal).localeCompare(String(aVal))
      : String(aVal).localeCompare(String(bVal));
  });

  const totalPages = Math.ceil(aggregated.length / PAGE_SIZE);
  const paginated = aggregated.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Origem de Tráfego (UTMs)</h3>
      {aggregated.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">Nenhum dado de UTM capturado</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("source")}>
                  <span className="flex items-center gap-1">Source <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("campaign")}>
                  <span className="flex items-center gap-1">Campaign <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("medium")}>
                  <span className="flex items-center gap-1">Medium <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
                <TableHead className="cursor-pointer text-right" onClick={() => toggleSort("count")}>
                  <span className="flex items-center gap-1 justify-end">Visitas <ArrowUpDown className="w-3 h-3" /></span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{row.source}</TableCell>
                  <TableCell className="font-mono text-xs">{row.campaign}</TableCell>
                  <TableCell className="font-mono text-xs">{row.medium}</TableCell>
                  <TableCell className="text-right font-bold">{row.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-muted-foreground">{aggregated.length} origens</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground">{page + 1}/{totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UTMSourceTable;
