var app = new Vue({
    el: '#employee-weekly-entry',
    components: {
        vuejsDatepicker
    },
    data: {
        loading: false,
        weeklyDatePicker: '',
        week: '',
        mon: '',
        tue: '',
        wed: '',
        thu: '',
        fri: '',
        sat: '',
        sun: '',
        mobileView: false,
        showView: 'mon',
        dayEntries: {},
        days: [
            "sun",
            "mon",
            "tue",
            "wed",
            "thu",
            "fri",
            "sat"
        ],
        total: {},
        currentTask: {
            desc: "",
            hours: 0,
            status: ""
        },
        projects: [
            "Annual Leave",
            "Casual Leave",
            "Sick Leave"
        ],
        selectedTasks: [],
        tasks: {},
        task: {},
        entries: [],
        entry: {}
    },
    methods: {
        dateSelected: function(date) {
            this.weeklyDatePicker = date;
            this.dateloader();
        },
        dateloader: function() {
            var current = new Date(this.weeklyDatePicker)
            var first = current.getDate() - current.getDay();
            var last = first + 6;
            var firstday = moment(new Date(current.setDate(first))).format("YYYY/MM/DD");
            var lastday = moment(new Date(current.setDate(last))).format("YYYY/MM/DD");
            this.week = firstday + " - " + lastday;
            this.week = firstday + " - " + lastday;

            this.sun = moment(new Date(current.setDate(first))).format("MM/DD");
            this.sat = moment(new Date(current.setDate(last))).format("MM/DD");
            this.mon = moment(new Date(current.setDate(first + 1))).format("MM/DD");
            this.tue = moment(new Date(current.setDate(first + 2))).format("MM/DD");
            this.wed = moment(new Date(current.setDate(first + 2))).format("MM/DD");
            this.thu = moment(new Date(current.setDate(last - 2))).format("MM/DD");
            this.fri = moment(new Date(current.setDate(last - 1))).format("MM/DD");
            this.dayEntries = {};
            for (let i = 0; i < 7; i++) {
                const d = moment(new Date(this.weeklyDatePicker)).day(i);
                this.dayEntries[d.format("ddd").toLowerCase()] = {
                    date: d.format("YYYY-MM-DD"),
                    day: d.format("ddd").toLowerCase(),
                    date_f: d.format("MM/DD"),
                    date_f2: d.format()
                };
            }
            this.calcEntries();
        },
        calcEntries: function() {
            this.days.forEach(d => {
                this.dayEntries[d].tasks = {};
                this.selectedTasks.forEach(t => {
                    this.entries.forEach(e => {
                        if (e.entry_date.substring(0, 10) == this.dayEntries[d].date && e.task_id == t) {
                            this.dayEntries[d].tasks[t] = e;
                        }
                    })
                });
                this.calculateTotal(d);
            });
            this.loading = true;
            console.log(this.dayEntries)
        },
        openDetailsModal: function(day, tid) {
            const task = this.getTask(day, tid);
            if (task) {
                this.currentTask = task;
                this.currentTask.status = this.getStatus(day, tid);
                this.currentTask.hours = this.getHours(day, tid);
                this.currentTask.fromTime = moment(task.entry_start).format("HH:mm");
                this.currentTask.toTime = moment(task.entry_end).format("HH:mm");
                //console.log(this.currentTask.fromTime, this.currentTask.toTime)
                this.$forceUpdate();
                new bootstrap.Modal(document.getElementById('exampleModal'), {}).show();
            }
        },
        getTask: function(day, tid) {
            return (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) ? this.dayEntries[day].tasks[tid] : undefined;
        },
        getHours: function(day, tid) {
            if (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) {
                var mins = this.dayEntries[day].tasks[tid].minutes;
                var hours = 0.0;
                hours = mins / 60;
                if (mins % 60 != 0) {
                    x = parseFloat((mins % 60) / 60);
                    hours += x;
                }
                return hours;
            } else {
                return 0;
            }
        },
        getStatus: function(day, tid) {
            return (this.dayEntries[day].tasks && this.dayEntries[day].tasks[tid]) ? this.dayEntries[day].tasks[tid].entry_status : 'pending';
        },
        winWidth: function() {
            var w = window.innerWidth;
            if (w < 768) {
                this.mobileView = true;
                this.showView = moment(new Date()).format("ddd").toLowerCase();
            } else if (w < 960) {
                this.mobileView = true;
                this.showView = moment(new Date()).format("ddd").toLowerCase();
            } else if (w < 1200) {
                this.mobileView = false;
            } else {
                this.mobileView = false;
            }
        },
        showViewFn: function(day) {
            return !this.mobileView || this.showView == day;
        },
        changeView: function(day) {
            this.showView = day;
        },
        addEvent({ type, target }) {
            var val = -1;
            if (parseFloat(target.value) >= 0) {
                val = target.value
            } else if (target.value == "") {
                val = 0;
            }
            if (val >= 0) {
                if (val > 0 && !this.dayEntries[target.dataset.day].tasks[target.dataset.key]) {
                    //create new entry and process
                    this.entry.task_id = parseInt(target.dataset.key);
                    this.entry.employee_id = 111;
                    this.entry.entry_date = this.dayEntries[target.dataset.day].date_f2;
                    this.entry.entry_start = moment().format();
                    this.entry.entry_end = moment().add(val, 'hours').format();
                    this.entry.minutes = val * 60;
                    this.entry.entry_status = "pending";
                    this.createEntry();
                } else if (val >= 0 && this.dayEntries[target.dataset.day].tasks[target.dataset.key]) {
                    //update existing entry
                    this.dayEntries[target.dataset.day].tasks[target.dataset.key].minutes = val * 60;
                    this.dayEntries[target.dataset.day].tasks[target.dataset.key].entry_start = moment().format();
                    this.dayEntries[target.dataset.day].tasks[target.dataset.key].entry_end = moment().add(val, 'hours').format();

                    this.entry.entry_id = this.dayEntries[target.dataset.day].tasks[target.dataset.key].entry_id;
                    this.entry.task_id = parseInt(target.dataset.key);
                    this.entry.employee_id = this.dayEntries[target.dataset.day].tasks[target.dataset.key].employee_id;
                    this.entry.entry_date = this.dayEntries[target.dataset.day].date_f2;
                    this.entry.entry_start = moment().format();
                    this.entry.entry_end = moment().add(val, 'hours').format();
                    this.entry.minutes = val * 60;
                    this.entry.entry_status = "pending";
                    this.updateEntry(this.entry.entry_id);
                }
                this.$forceUpdate();
                this.calculateTotal(target.dataset.day);
            }
        },
        addModalEvent: function() {
            this.loading = false;
            this.entries.forEach(e => {
                if (e.entry_date == this.currentTask.entry_date && e.task_id == this.currentTask.task_id) {
                    this.currentTask.toTime = moment(this.currentTask.fromTime, "HH:mm").add(this.currentTask.hours, 'h').format("HH:mm")
                    e.description = this.currentTask.description;
                    e.minutes = this.currentTask.hours * 60;
                    e.entry_status = this.currentTask.status;

                    this.entry.entry_id = e.entry_id
                    this.entry.task_id = e.task_id;
                    this.entry.employee_id = e.employee_id;
                    this.entry.entry_date = e.entry_date;
                    this.entry.entry_start = moment(e.entry_date).set({ 'hour': this.currentTask.fromTime.substring(0, 2), 'minute': this.currentTask.fromTime.substring(3, 5) }).format();
                    this.entry.entry_end = moment(e.entry_date).set({ 'hour': this.currentTask.toTime.substring(0, 2), 'minute': this.currentTask.toTime.substring(3, 5) }).format();
                    this.entry.description = this.currentTask.description;
                    this.entry.minutes = this.currentTask.hours * 60;
                    this.entry.entry_status = this.currentTask.status;
                    this.updateEntry(e.entry_id);
                }
            });
            this.$forceUpdate();
            this.dateloader();
        },
        openTasksModal: function() {
            new bootstrap.Modal(document.getElementById('tasksModal'), {}).show();
        },
        calculateTotal: function(day) {
            var data = JSON.parse(JSON.stringify(this.dayEntries));
            var total = 0.0;
            Object.keys(data[day].tasks).forEach(function(key) {
                var mins = data[day].tasks[key].minutes;
                var hours = 0.0;
                hours = mins / 60;
                if (mins % 60 != 0) {
                    x = parseFloat((mins % 60) / 60);
                    hours += x;
                }
                if (parseFloat(hours) > 0) {
                    total = +(total + parseFloat(hours));
                }
            });
            var md = moment.duration(total, 'hours');
            var s = (md._data.hours > 0) ? md._data.hours + "h " : "";
            s = s.concat((md._data.minutes > 0) ? md._data.minutes + "m " : "");
            this.total[day] = s;
            this.$forceUpdate();
        },
        addTask: function(t) {
            this.task.ticket_id = "Leave ticket";
            this.task.summary = t;
            this.task.task_start_date = moment().format();
            this.task.task_end_date = moment().add(9, 'h').format();
            this.task.task_estimated_minutes = 540;
            this.task.project_id = 1;
            this.task.project = "Leave";
            this.task.assignees = ["Aswanth"]

            axios.post('http://localhost:9000/task/add_task', this.task)
                .then(response => {
                    this.tasks = {}
                    this.selectedTasks = []
                    this.getEmployeeTask()
                    console.log(response)
                }).catch(error => { console.log(error); });
            this.$forceUpdate();
            bootstrap.Modal.getInstance(document.getElementById('tasksModal')).hide();
        },
        createEntry: function() {
            axios.post('http://localhost:9000/entry/add_entry', this.entry)
                .then(response => {
                    console.log(response)
                    this.getEmployeeEntry();
                }).catch(error => { console.log(error); });
        },
        updateEntry: function(entryid) {
            axios.put('http://localhost:9000/entry/update_entry/' + entryid, this.entry)
                .then(response => {
                    console.log(response)
                }).catch(error => { console.log(error); });
        },
        getEmployeeEntry: function() {
            axios.get('http://localhost:9000/entry/get_employee_entry/' + 111)
                .then(response => {
                    if (response.data.Entries != null) {
                        response.data.Entries.forEach(r => {
                            this.entries[r.entry_id] = r
                        })
                    }
                    this.dateloader();
                }).catch(error => { console.log(error); });
        },
        getEmployeeTask: function() {
            axios.get('http://localhost:9000/task/get_employee_task/' + 111)
                .then(response => {
                    if (response.data.Tasks != null) {
                        response.data.Tasks.forEach(r => {
                            this.tasks[r.task_id] = r
                            this.selectedTasks.push(r.task_id)
                        })
                    }
                    this.dateloader();
                }).catch(error => { console.log(error); });
        }
    },
    mounted() {
        axios.get('http://localhost:9000/task/get_employee_task/' + 111)
            .then(response => {
                if (response.data.Tasks != null) {
                    response.data.Tasks.forEach(r => {
                        this.tasks[r.task_id] = r
                        this.selectedTasks.push(r.task_id)
                    })
                }
            }).catch(error => { console.log(error); });
        axios.get('http://localhost:9000/entry/get_employee_entry/' + 111)
            .then(response => {
                if (response.data.Entries != null) {
                    response.data.Entries.forEach(r => {
                        this.entries[r.entry_id] = r
                    })
                }
                this.weeklyDatePicker = moment(new Date()).format("YYYY-MM-DD");
                this.dateloader();
            }).catch(error => { console.log(error); });
        this.winWidth()
    }
});