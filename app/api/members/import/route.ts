import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

const knownAnnualFees: Record<number, number> = {
  2025: 12,
  2026: 24,
};

function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function text(value: unknown) {
  const normalized = String(value ?? "").trim();
  return normalized.length > 0 ? normalized : null;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(String(value ?? "").replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(value: unknown) {
  const normalized = normalizeHeader(value);
  return ["1", "sim", "s", "yes", "y", "true", "x"].includes(normalized);
}

function paidValue(value: unknown) {
  const normalized = normalizeHeader(value);
  return ["1", "sim", "s", "yes", "y", "true", "x", "pago", "paid"].includes(normalized);
}

function excelDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;

  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }

  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const parts = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (parts) {
    const day = Number(parts[1]);
    const month = Number(parts[2]);
    const year = Number(parts[3].length === 2 ? `19${parts[3]}` : parts[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildHeaderIndex(headerRow: unknown[]) {
  const index = new Map<string, number>();

  headerRow.forEach((header, columnIndex) => {
    const normalized = normalizeHeader(header);
    if (normalized) index.set(normalized, columnIndex);
  });

  const find = (...candidates: string[]) => {
    for (const candidate of candidates) {
      const normalized = normalizeHeader(candidate);
      const exact = index.get(normalized);
      if (exact !== undefined) return exact;

      for (const [header, columnIndex] of index.entries()) {
        if (header.includes(normalized) || normalized.includes(header)) return columnIndex;
      }
    }

    return -1;
  };

  return {
    memberNumber: find("Socio n", "Socio no", "Socio numero"),
    name: find("Nome"),
    address: find("Morada"),
    nif: find("NIF"),
    birthDate: find("Data Nasc", "Data Nascimento"),
    email: find("Email"),
    phone: find("N Tel", "No Tel", "Telefone"),
    submittedAt: find("Submetido em reuniao de direcao", "Submetido"),
    category: find("Categoria"),
    formInArchive: find("Formulario no Arquivo", "Arquivo"),
    note: find("Nota"),
  };
}

function extractQuotaColumns(headerRow: unknown[]) {
  return headerRow
    .map((header, columnIndex) => {
      const label = String(header ?? "");
      const year = label.match(/\b(20\d{2})\b/);
      if (!year) return null;

      const parsedYear = Number(year[1]);
      const amountFromHeader = label.match(/(\d+(?:[,.]\d+)?)\s*€/);
      const amount = amountFromHeader
        ? Number(amountFromHeader[1].replace(",", "."))
        : knownAnnualFees[parsedYear] ?? 0;

      return { columnIndex, year: parsedYear, amount };
    })
    .filter((column): column is { columnIndex: number; year: number; amount: number } => Boolean(column));
}

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Envie um ficheiro Excel." }, { status: 400 });
  }

  const workbook = XLSX.read(await file.arrayBuffer(), {
    cellDates: true,
    type: "array",
  });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    raw: true,
  });

  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => normalizeHeader(cell) === "nome")
  );

  if (headerRowIndex < 0) {
    return NextResponse.json({ error: "Nao encontrei a linha de cabecalhos com a coluna Nome." }, { status: 400 });
  }

  const headerRow = rows[headerRowIndex];
  const columns = buildHeaderIndex(headerRow);
  const quotaColumns = extractQuotaColumns(headerRow);

  if (columns.name < 0) {
    return NextResponse.json({ error: "A coluna Nome e obrigatoria." }, { status: 400 });
  }

  const summary = {
    createdMembers: 0,
    updatedMembers: 0,
    createdPayments: 0,
    updatedPayments: 0,
    skippedRows: 0,
    warnings: [] as string[],
  };

  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const name = text(row[columns.name]);
    if (!name) {
      summary.skippedRows += 1;
      continue;
    }

    const memberNumber =
      columns.memberNumber >= 0 ? numberValue(row[columns.memberNumber]) : null;
    const email = columns.email >= 0 ? text(row[columns.email]) : null;
    const nif = columns.nif >= 0 ? text(row[columns.nif]) : null;

    const data = {
      name,
      address: columns.address >= 0 ? text(row[columns.address]) : null,
      nif,
      birthDate: columns.birthDate >= 0 ? excelDate(row[columns.birthDate]) : null,
      email,
      phone: columns.phone >= 0 ? text(row[columns.phone]) : null,
      submittedAt: columns.submittedAt >= 0 ? excelDate(row[columns.submittedAt]) : null,
      category: columns.category >= 0 ? text(row[columns.category]) : null,
      formInArchive:
        columns.formInArchive >= 0 ? booleanValue(row[columns.formInArchive]) : false,
      note: columns.note >= 0 ? text(row[columns.note]) : null,
    };

    let member;
    if (memberNumber) {
      const existingByNumber = await prisma.member.findUnique({ where: { memberNumber } });
      member = await prisma.member.upsert({
        where: { memberNumber },
        update: data,
        create: { ...data, memberNumber },
      });

      if (existingByNumber) summary.updatedMembers += 1;
      else summary.createdMembers += 1;
    } else {
      const lookup = [
        email ? { email } : null,
        nif ? { nif } : null,
      ].filter((item): item is { email: string } | { nif: string } => Boolean(item));

      const existingMember =
        lookup.length > 0
          ? await prisma.member.findFirst({ where: { OR: lookup } })
          : null;

      if (existingMember) {
        member = await prisma.member.update({ where: { id: existingMember.id }, data });
        summary.updatedMembers += 1;
      } else {
        member = await prisma.member.create({ data });
        summary.createdMembers += 1;
      }
    }

    for (const quota of quotaColumns) {
      if (!paidValue(row[quota.columnIndex])) continue;

      if (quota.amount === 0) {
        summary.warnings.push(
          `Linha ${rowIndex + 1}: quota ${quota.year} marcada como paga, mas sem valor no cabecalho.`
        );
      }

      const existingPayment = await prisma.payment.findFirst({
        where: { memberId: member.id, year: quota.year },
      });

      if (existingPayment) {
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { amount: quota.amount, status: "PAID" },
        });
        summary.updatedPayments += 1;
      } else {
        await prisma.payment.create({
          data: {
            memberId: member.id,
            year: quota.year,
            amount: quota.amount,
            status: "PAID",
          },
        });
        summary.createdPayments += 1;
      }
    }
  }

    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("Excel import failed", error);
    return NextResponse.json(
      { error: error?.message ?? "Erro ao importar Excel." },
      { status: 500 }
    );
  }
}
