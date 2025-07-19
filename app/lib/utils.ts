
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return formatDate(d);
}

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Number formatting
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Percentage formatting
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

// Calculate qualification score
export function calculateQualificationScore(responses: Record<string, any>): number {
  let score = 0;
  const maxScore = 100;

  // Monthly revenue (30 points max)
  const revenue = responses.monthlyRevenue;
  if (revenue >= 17000) {
    score += 30;
  } else if (revenue >= 10000) {
    score += 20;
  } else if (revenue >= 5000) {
    score += 10;
  }

  // Years in business (25 points max)
  const years = responses.yearsInBusiness;
  if (years >= 2) {
    score += 25;
  } else if (years >= 1) {
    score += 15;
  } else if (years >= 0.5) {
    score += 10;
  }

  // Business type (20 points max)
  const businessType = responses.businessType;
  const highValueTypes = ['MEDICAL_OFFICE', 'DENTAL_PRACTICE', 'SPECIALTY_CLINIC'];
  const mediumValueTypes = ['VETERINARY_CLINIC', 'URGENT_CARE', 'PHYSICAL_THERAPY'];
  
  if (highValueTypes.includes(businessType)) {
    score += 20;
  } else if (mediumValueTypes.includes(businessType)) {
    score += 15;
  } else {
    score += 10;
  }

  // Employee count (15 points max)
  const employees = responses.employeeCount;
  if (employees >= 10) {
    score += 15;
  } else if (employees >= 5) {
    score += 10;
  } else if (employees >= 2) {
    score += 5;
  }

  // Location (US requirement - 10 points max)
  if (responses.isUSBased) {
    score += 10;
  }

  return Math.min(score, maxScore);
}

// Check if prospect meets minimum qualifications
export function meetsMinimumQualifications(prospect: any): boolean {
  const hasMinRevenue = prospect.monthlyRevenue >= 17000;
  const hasMinExperience = prospect.yearsInBusiness >= 0.5;
  const isUSBased = !!prospect.state; // Has US state
  
  return hasMinRevenue && hasMinExperience && isUSBased;
}

// Generate qualification indicators
export function getQualificationIndicators(prospect: any): Array<{
  label: string;
  met: boolean;
  value?: string;
}> {
  return [
    {
      label: 'Min $17K Monthly Revenue',
      met: prospect.monthlyRevenue >= 17000,
      value: prospect.monthlyRevenue ? formatCurrency(prospect.monthlyRevenue) : 'Unknown'
    },
    {
      label: '6+ Months in Business',
      met: prospect.yearsInBusiness >= 0.5,
      value: prospect.yearsInBusiness ? `${prospect.yearsInBusiness} years` : 'Unknown'
    },
    {
      label: 'US-Based Business',
      met: !!prospect.state,
      value: prospect.state || 'Unknown'
    },
    {
      label: 'Healthcare Business',
      met: !!prospect.businessType,
      value: prospect.businessType?.replace('_', ' ') || 'Unknown'
    }
  ];
}

// Export data to CSV
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: Array<{ key: keyof T; header: string }>
): void {
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(',')
  );
  
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Parse CSV import
export function parseCSV(csvText: string): Array<Record<string, string>> {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
}
