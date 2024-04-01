document.addEventListener('DOMContentLoaded', async function () {
    const bars = document.querySelectorAll('.bar');
    const barData = await fetchBarData();
    const dateRange = calculateDateRange(90);
    const currentHours = new Date().getHours();

    bars.forEach((bar, index) => {
        const popupBox = document.createElement('div');
        popupBox.classList.add('popup-box');
        document.body.appendChild(popupBox);

        bar.addEventListener('mouseenter', () => {
            const date = dateRange[index % dateRange.length];

            const dateFound = barData.find( item => {
                return item.date == date
            })
            let uptime = undefined
            if (dateFound && dateFound["uptime"]) {
                uptime = dateFound["uptime"]
                if (dateFound["date"] === "2024-03-23") {
                    if (uptime === currentHours) {
                        bar.classList.add("bar-green");
                    } else {
                        bar.classList.add("bar-red");
                    }
                } else {
                    if (uptime === 24) {
                        bar.classList.add("bar-green");
                    } else {
                        bar.classList.add("bar-red");
                    }
                }
            } else {
                bar.classList.add("bar-not-found");
            }
            const barDetail = getBarDetail(date, uptime);

            popupBox.innerHTML = `<strong>${date}</strong><br/><br/>${barDetail}`;
            const barPosition = bar.getBoundingClientRect();
            const scrollOffset = document.documentElement.scrollTop;

            popupBox.style.left = `${barPosition.left}px`;
            popupBox.style.top = `${barPosition.bottom + scrollOffset}px`;

            popupBox.style.display = 'block';
        });

        bar.addEventListener('mouseleave', () => {
            popupBox.style.display = 'none';
        });
    });

    async function fetchBarData() {
        const containerData = [
            { "date": "09 March 2024", "uptime": 18 },
            { "date": "10 March 2024", "uptime": 13 }
        ];
    
        return containerData;
    }

    function getBarDetail(date, uptime) {
        return uptime === undefined
            ? 'No record found for this date.'
            : uptime === 24
                ? 'No downtime recorded on this day.'
                : `Downtime: ${24 - uptime} hours.`;
    }

    function calculateDateRange(totalBars) {
        const currentDate = new Date();
        const dateRange = [];

        for (let i = totalBars - 1; i >= 0; i--) {
            const pastDate = new Date(currentDate);
            pastDate.setDate(currentDate.getDate() - (totalBars - 1 - i));

            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];

            const formattedDate = `${addLeadingZero(pastDate.getDate())} ${monthNames[pastDate.getMonth()]} ${pastDate.getFullYear()}`;
            dateRange.push(formattedDate);
        }

        return dateRange.reverse();
    }

    function addLeadingZero(number) {
        return number < 10 ? `0${number}` : number;
    }

});
