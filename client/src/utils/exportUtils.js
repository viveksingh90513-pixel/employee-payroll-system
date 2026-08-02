/**
 * PayRoll Pro – Data Export Utility
 * Handles exporting tables and datasets to CSV files.
 */

export const exportToCSV = (filename, data, headers) => {
  if (!data || !data.length) return;

  const headerKeys = Object.keys(headers);
  const headerLabels = Object.values(headers);

  const csvRows = [];
  csvRows.push(headerLabels.join(','));

  for (const row of data) {
    const values = headerKeys.map(key => {
      const val = row[key] !== undefined && row[key] !== null ? row[key] : '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
