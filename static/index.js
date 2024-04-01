function getUptimeForDate(dateArray, searchDate) {
    for (var i = 0; i < dateArray.length; i++) {
        if (dateArray[i].date === searchDate) {
            return dateArray[i].uptime
        }
    }
    return null
}

function generateDateArray(date) {
    var dateArray = []
    var currentDate = new Date(date)
    dateArray.push(date)

    for (var counter = 1; counter <= 90; counter++) {
        currentDate.setDate(currentDate.getDate() - 1)
        var year = currentDate.getFullYear()
        var month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
        var day = ('0' + currentDate.getDate()).slice(-2)
        var date = year + '-' + month + '-' + day
        dateArray.push(date)
    }

    return dateArray.sort((d1, d2) => new Date(d1) - new Date(d2))
}

function formatDate(dateString) {
    var date = new Date(dateString)
    var monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]
    var day = date.getDate()
    var month = monthNames[date.getMonth()]
    var year = date.getFullYear()

    var formattedDate = day + ' ' + month + ' ' + year
    return formattedDate
}

$(document).ready(function() {

    const now = new Date()
    const year = now.getFullYear()
    const month = ('0' + (now.getMonth() + 1)).slice(-2)
    const day = ('0' + now.getDate()).slice(-2)
    const currentDate = `${year}-${month}-${day}`
    const hoursElapsed = now.getHours()
    console.log(`Current Hours Elapsed: ${hoursElapsed}`)

    var dateArray = generateDateArray(currentDate)

    for (var counter1 = 0; counter1 < appList.length; counter1++) {

        var status = appList[counter1].last_status === 200 ? "Operational" : "Outage"
        $(`#container-${counter1+1}-status`).html(status)

        for (var counter2 = 0; counter2 < dateArray.length; counter2++) {
            var uptimeValue = getUptimeForDate(appList[counter1].status, dateArray[counter2])
            if (uptimeValue === null) {
                $(`#container-${counter1+1}-bar-${counter2}`).addClass("bar-not-found")
                $(`#container-${counter1+1}-popup-${counter2}`).html(`<strong>${formatDate(dateArray[counter2])}</strong><br/><br/><div class="popup-label"><i class="fa-solid fa-circle-question fa-shake fa-xl icon" style="color: #ff8000;"></i><span>No records found for this day.</span></div>`)
            } else if ((dateArray[counter2] !== currentDate && uptimeValue === 24) || (dateArray[counter2] === currentDate && uptimeValue === hoursElapsed)) {
                $(`#container-${counter1+1}-bar-${counter2}`).addClass("bar-green")
                $(`#container-${counter1+1}-popup-${counter2}`).html(`<strong>${formatDate(dateArray[counter2])}</strong><br/><br/><div class="popup-label"><i class="fa-solid fa-shield-halved fa-flip fa-xl icon" style="color: #4CAF50;--fa-animation-duration: 2s;"></i><span>No downtime recorded on this day.</span></div>`)
            } else {
                $(`#container-${counter1+1}-bar-${counter2}`).addClass("bar-red")
                $(`#container-${counter1+1}-popup-${counter2}`).html(`<strong>${formatDate(dateArray[counter2])}</strong><br/><br/><div class="popup-label"><i class="fa-solid fa-triangle-exclamation fa-fade fa-xl icon" style="color: #e04e50;--fa-animation-duration: 2s; --fa-fade-opacity: 0.6;"></i><span>Downtime reported for x hours on this day.</span></div>`)
            }
        }
    }

    $('.bar').on({
        mouseenter: function() {
            const barPosition = this.getBoundingClientRect()
            const scrollOffset = document.documentElement.scrollTop;
            let boxId = this.id.replace('bar', 'popup')
            $(`#${boxId}`).css('left', `${barPosition.left}px`)
            $(`#${boxId}`).css('top', `${barPosition.bottom + scrollOffset}px`)
            $(`#${boxId}`).css('display', 'block')
        },
        mouseleave: function() {
            let boxId = this.id.replace('bar', 'popup')
            $(`#${boxId}`).css('display', 'none')
        }
    })

    $('.icon-tooltip').each(function() {
        let tooltipId = $(this).attr('id')
        let tooltipPopupId = tooltipId.replace('tooltip', 'tooltip-popup')
        $(this).hover(function() {
            $(`#${tooltipPopupId}`).toggleClass('show')
        }, function() {
            $(`#${tooltipPopupId}`).removeClass('show')
        })
    })
})
