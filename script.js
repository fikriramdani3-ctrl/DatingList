// ========================================
// SUPABASE CONFIG
// ========================================

// GANTI DENGAN URL SUPABASE KAMU
const SUPABASE_URL =
    "https://zbouaihfybnoqpkoestq.supabase.co";


// GANTI DENGAN PUBLISHABLE / ANON KEY
const SUPABASE_KEY =
    "sb_publishable_XIjoyss2578XMuuip-6sbw_eCCq7gWE";


// Membuat koneksi Supabase
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
// ========================================
// ELEMENT HTML
// ========================================

const dateInput =
    document.getElementById("dateInput");

const addButton =
    document.getElementById("addButton");

const dateList =
    document.getElementById("dateList");


// ========================================
// DATA
// ========================================

let dates = [];

let currentFilter = "all";

let draggedId = null;


// ========================================
// LOAD DATA DARI SUPABASE
// ========================================

async function loadDates() {

    dateList.innerHTML = `
        <div class="empty">
            Memuat dating list... 💕
        </div>
    `;

    const {
        data,
        error
    } = await supabaseClient
        .from("dates")
        .select("*")
        .order("position", {
            ascending: true
        })
        .order("created_at", {
            ascending: false
        });


    // Error

    if (error) {

        console.error(
            "Supabase Error:",
            error
        );

        dateList.innerHTML = `
            <div class="empty">
                ❌ Gagal mengambil data

                <small>
                    ${error.message}
                </small>
            </div>
        `;

        return;
    }


    // Simpan data

    dates = data || [];


    // Tampilkan

    renderDates();
}


// ========================================
// RENDER DATA
// ========================================

function renderDates() {

    dateList.innerHTML = "";


    // Filter

    const filteredDates =
        dates.filter(date => {

            if (
                currentFilter ===
                "completed"
            ) {

                return date.completed === true;

            }


            if (
                currentFilter ===
                "pending"
            ) {

                return date.completed === false;

            }


            return true;

        });


    // Tidak ada data

    if (
        filteredDates.length === 0
    ) {

        dateList.innerHTML = `
            <div class="empty">
                Belum ada date 💗
            </div>
        `;

        return;
    }


    // ====================================
    // TAMPILKAN DATE
    // ====================================

    filteredDates.forEach(date => {

        const li =
            document.createElement("li");


        li.className =
            "date-item";


        // Simpan ID

        li.dataset.id =
            date.id;


        // Completed

        if (date.completed) {

            li.classList.add(
                "completed"
            );

        }


        // ====================================
        // DRAG
        // ====================================

        li.draggable = true;


        li.addEventListener(
            "dragstart",
            handleDragStart
        );


        li.addEventListener(
            "dragover",
            handleDragOver
        );


        li.addEventListener(
            "drop",
            handleDrop
        );


        li.addEventListener(
            "dragend",
            handleDragEnd
        );


        // ====================================
        // CHECK
        // ====================================

        const check =
            document.createElement("div");


        check.className =
            "check";


        check.onclick = () => {

            toggleDate(date.id);

        };


        // ====================================
        // TEXT
        // ====================================

        const text =
            document.createElement("div");


        text.className =
            "date-text";


        text.textContent =
            date.name;


        text.onclick = () => {

            toggleDate(date.id);

        };


        // ====================================
        // EDIT BUTTON
        // ====================================

        const editButton =
            document.createElement("button");


        editButton.className =
            "edit-button";


        editButton.textContent =
            "✏️";


        editButton.title =
            "Edit";


        editButton.onclick = (event) => {

            event.stopPropagation();

            editDate(
                date.id,
                text
            );

        };


        // ====================================
        // DELETE BUTTON
        // ====================================

        const deleteButton =
            document.createElement("button");


        deleteButton.className =
            "delete-button";


        deleteButton.textContent =
            "🗑️";


        deleteButton.title =
            "Hapus";


        deleteButton.onclick = (event) => {

            event.stopPropagation();

            deleteDate(
                date.id
            );

        };


        // ====================================
        // MASUKKAN ELEMENT
        // ====================================

        li.appendChild(check);

        li.appendChild(text);

        li.appendChild(editButton);

        li.appendChild(deleteButton);


        dateList.appendChild(li);

    });
}


// ========================================
// TAMBAH DATE
// ========================================

async function addDate() {

    const name =
        dateInput.value.trim();


    // Input kosong

    if (name === "") {

        alert(
            "Tulis dulu date-nya 😭"
        );

        return;
    }


    // Loading

    addButton.disabled = true;

    addButton.textContent =
        "⏳";


    // Tentukan posisi

    const position =
        dates.length > 0
            ? Math.min(
                ...dates.map(
                    date =>
                        date.position ?? 0
                )
            ) - 1
            : 0;


    // Insert

    const {
        data,
        error
    } = await supabaseClient
        .from("dates")
        .insert([
            {
                name: name,

                completed: false,

                position: position
            }
        ])
        .select();


    // Error

    if (error) {

        console.error(
            "Insert Error:",
            error
        );

        alert(
            "Gagal menambahkan date:\n\n" +
            error.message
        );

        addButton.disabled =
            false;

        addButton.textContent =
            "+";

        return;
    }


    // Masukkan data baru

    if (
        data &&
        data.length > 0
    ) {

        dates.unshift(
            data[0]
        );

    }


    // Reset

    dateInput.value = "";

    addButton.disabled =
        false;

    addButton.textContent =
        "+";


    renderDates();
}


// ========================================
// EDIT DATE
// ========================================

async function editDate(
    id,
    textElement
) {

    const date =
        dates.find(
            item =>
                item.id === id
        );


    if (!date) {

        return;

    }


    // Buat input edit

    const input =
        document.createElement("input");


    input.type =
        "text";


    input.className =
        "edit-input";


    input.value =
        date.name;


    // Ganti text dengan input

    textElement.replaceWith(
        input
    );


    input.focus();

    input.select();


    let finished =
        false;


    // ====================================
    // SIMPAN EDIT
    // ====================================

    async function saveEdit() {

        if (finished) {
            return;
        }

        finished = true;


        const newName =
            input.value.trim();


        // Kosong

        if (
            newName === ""
        ) {

            renderDates();

            return;

        }


        // Tidak berubah

        if (
            newName === date.name
        ) {

            renderDates();

            return;

        }


        input.disabled =
            true;


        const {
            error
        } = await supabaseClient

            .from("dates")

            .update({
                name: newName
            })

            .eq(
                "id",
                id
            );


        // Error

        if (error) {

            console.error(
                "Edit Error:",
                error
            );

            alert(
                "Gagal mengedit date:\n\n" +
                error.message
            );

            renderDates();

            return;
        }


        // Update lokal

        dates =
            dates.map(item => {

                if (
                    item.id === id
                ) {

                    return {
                        ...item,

                        name: newName
                    };

                }

                return item;

            });


        renderDates();
    }


    // ====================================
    // ENTER
    // ====================================

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                saveEdit();

            }


            if (
                event.key ===
                "Escape"
            ) {

                finished = true;

                renderDates();

            }

        }
    );


    // Klik keluar input

    input.addEventListener(
        "blur",
        saveEdit
    );
}


// ========================================
// TOGGLE SELESAI
// ========================================

async function toggleDate(id) {

    const date =
        dates.find(
            item =>
                item.id === id
        );


    if (!date) {

        return;

    }


    const newStatus =
        !date.completed;


    const {
        error
    } = await supabaseClient

        .from("dates")

        .update({
            completed: newStatus
        })

        .eq(
            "id",
            id
        );


    // Error

    if (error) {

        console.error(
            "Update Error:",
            error
        );

        alert(
            "Gagal mengubah status:\n\n" +
            error.message
        );

        return;
    }


    // Update lokal

    dates =
        dates.map(item => {

            if (
                item.id === id
            ) {

                return {
                    ...item,

                    completed:
                        newStatus
                };

            }

            return item;

        });


    renderDates();
}


// ========================================
// DELETE DATE
// ========================================

async function deleteDate(id) {

    const yakin =
        confirm(
            "Yakin mau menghapus date ini? 🥺"
        );


    if (!yakin) {

        return;

    }


    const {
        error
    } = await supabaseClient

        .from("dates")

        .delete()

        .eq(
            "id",
            id
        );


    // Error

    if (error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "Gagal menghapus date:\n\n" +
            error.message
        );

        return;
    }


    // Hapus lokal

    dates =
        dates.filter(
            item =>
                item.id !== id
        );


    renderDates();
}


// ========================================
// DRAG START
// ========================================

function handleDragStart(event) {

    draggedId =
        event.currentTarget.dataset.id;


    event.currentTarget.classList.add(
        "dragging"
    );


    event.dataTransfer.effectAllowed =
        "move";


    event.dataTransfer.setData(
        "text/plain",
        draggedId
    );
}


// ========================================
// DRAG OVER
// ========================================

function handleDragOver(event) {

    event.preventDefault();


    const item =
        event.currentTarget;


    const draggingItem =
        document.querySelector(
            ".dragging"
        );


    if (
        !draggingItem ||
        draggingItem === item
    ) {

        return;

    }


    const rect =
        item.getBoundingClientRect();


    const middle =
        rect.top +
        rect.height / 2;


    if (
        event.clientY <
        middle
    ) {

        item.parentNode.insertBefore(
            draggingItem,
            item
        );

    } else {

        item.parentNode.insertBefore(
            draggingItem,
            item.nextSibling
        );

    }
}


// ========================================
// DROP
// ========================================

async function handleDrop(event) {

    event.preventDefault();


    // Ambil urutan dari HTML

    const items =
        [...dateList.querySelectorAll(
            ".date-item"
        )];


    const orderedIds =
        items.map(
            item =>
                item.dataset.id
        );


    // Update array lokal

    dates.sort(
        (a, b) => {

            return (
                orderedIds.indexOf(
                    String(a.id)
                ) -
                orderedIds.indexOf(
                    String(b.id)
                )
            );

        }
    );


    // Simpan posisi

    await savePositions();
}


// ========================================
// DRAG END
// ========================================

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );


    draggedId =
        null;
}


// ========================================
// SIMPAN POSISI KE SUPABASE
// ========================================

async function savePositions() {

    for (
        let i = 0;
        i < dates.length;
        i++
    ) {

        const date =
            dates[i];


        const {
            error
        } = await supabaseClient

            .from("dates")

            .update({
                position: i
            })

            .eq(
                "id",
                date.id
            );


        if (error) {

            console.error(
                "Position Error:",
                error
            );

        }

    }


    // Update position lokal

    dates =
        dates.map(
            (date, index) => {

                return {
                    ...date,

                    position:
                        index
                };

            }
        );
}


// ========================================
// FILTER
// ========================================

function filterDates(
    filter,
    button
) {

    currentFilter =
        filter;


    document
        .querySelectorAll(
            ".filter button"
        )
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    renderDates();
}


// ========================================
// TOMBOL +
// ========================================

addButton.addEventListener(
    "click",
    addDate
);


// ========================================
// ENTER
// ========================================

dateInput.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            addDate();

        }

    }
);


// ========================================
// LOAD
// ========================================

loadDates();