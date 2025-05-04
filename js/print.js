document.addEventListener('DOMContentLoaded', function () {
    const exportBtn = document.getElementById('exportExcelButton');

    exportBtn.addEventListener('click', function () {
        const wb = XLSX.utils.book_new();
        const ws_data = [];

        const sections = document.querySelectorAll('#all-members-content .table-data');

        sections.forEach((section, index) => {
            const sectionTitle = section.querySelector('.head h3')?.textContent.trim() || `Section ${index + 1}`;
            const table = section.querySelector('table');
            if (!table) return;

            // Add section title as a merged row
            ws_data.push([sectionTitle]);
            ws_data.push([]); // Empty row for spacing

            const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText);
            headers.pop(); // Remove last column ("Action")
            ws_data.push(headers);

            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(tr => {
                const rowData = Array.from(tr.querySelectorAll('td')).map(td => td.innerText);
                rowData.pop(); // Remove "Action" column
                ws_data.push(rowData);
            });

            ws_data.push([]); // Add an empty row after each section
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, 'History & Payments');
        XLSX.writeFile(wb, 'Logs.xlsx');
    });
});
