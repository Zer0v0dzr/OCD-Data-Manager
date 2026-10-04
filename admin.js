// ============================================================
// OCD Adolescent Data Manager
// Admin Logic
// ============================================================


// ============================================================
// State
// ============================================================

let allSessions = [];

let filteredSessions = [];

let subjectOverviewRows = [];

let currentSubjectRows = [];

let currentDetailSession = null;

let currentDetailRows = [];


// Selected subject IDs / names
// Store normalized lowercase subject key.

const selectedSubjects =
    new Set();


// ============================================================
// DOM
// ============================================================

const loginPage =
    document.getElementById(
        "login-page"
    );

const appPage =
    document.getElementById(
        "app-page"
    );

const emailInput =
    document.getElementById(
        "email-input"
    );

const passwordInput =
    document.getElementById(
        "password-input"
    );

const loginButton =
    document.getElementById(
        "login-button"
    );

const loginError =
    document.getElementById(
        "login-error"
    );

const logoutButton =
    document.getElementById(
        "logout-button"
    );

const adminEmail =
    document.getElementById(
        "admin-email"
    );

const viewMode =
    document.getElementById(
        "view-mode"
    );

const subjectSearch =
    document.getElementById(
        "subject-search"
    );

const taskFilter =
    document.getElementById(
        "task-filter"
    );

const statusFilter =
    document.getElementById(
        "status-filter"
    );

const refreshButton =
    document.getElementById(
        "refresh-button"
    );

const exportButton =
    document.getElementById(
        "export-button"
    );

const exportSSTButton =
    document.getElementById(
        "export-sst-button"
    );

const exportBeadsButton =
    document.getElementById(
        "export-beads-button"
    );

const dataStatus =
    document.getElementById(
        "data-status"
    );

const sessionTableBody =
    document.getElementById(
        "session-table-body"
    );

const batchToolbar =
    document.getElementById(
        "batch-toolbar"
    );

const selectAllButton =
    document.getElementById(
        "select-all-button"
    );

const clearSelectionButton =
    document.getElementById(
        "clear-selection-button"
    );

const selectionCount =
    document.getElementById(
        "selection-count"
    );

const batchDownloadHint =
    document.getElementById(
        "batch-download-hint"
    );

const batchDownloadButton =
    document.getElementById(
        "batch-download-button"
    );

const detailModal =
    document.getElementById(
        "detail-modal"
    );

const detailTitle =
    document.getElementById(
        "detail-title"
    );

const detailSubtitle =
    document.getElementById(
        "detail-subtitle"
    );

const detailInfo =
    document.getElementById(
        "detail-info"
    );

const detailTableHead =
    document.getElementById(
        "detail-table-head"
    );

const detailTableBody =
    document.getElementById(
        "detail-table-body"
    );

const closeDetailButton =
    document.getElementById(
        "close-detail-button"
    );

const downloadSessionButton =
    document.getElementById(
        "download-session-button"
    );

const loadingOverlay =
    document.getElementById(
        "loading-overlay"
    );

const loadingText =
    document.getElementById(
        "loading-text"
    );


// ============================================================
// General Helpers
// ============================================================

function normalizeSubject(
    subject
){

    return String(
        subject || ""
    )
    .trim()
    .toLowerCase();

}


function safeFilename(
    value
){

    return String(
        value || ""
    )
    .replace(
        /[<>:"/\\|?*\x00-\x1F]/g,
        "_"
    )
    .trim();

}


function shortSessionID(
    sessionID
){

    if(
        !sessionID
    ){

        return "session";

    }

    return String(
        sessionID
    )
    .slice(
        0,
        8
    );

}


function getDateStamp(){

    const now =
        new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );

    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );

    return (
        year +
        month +
        day
    );

}


function setLoading(
    visible,
    text = "正在加载..."
){

    loadingText.textContent =
        text;

    if(
        visible
    ){

        loadingOverlay
            .classList
            .remove(
                "hidden"
            );

    }
    else{

        loadingOverlay
            .classList
            .add(
                "hidden"
            );

    }

}


function showLoginPage(){

    loginPage
        .classList
        .remove(
            "hidden"
        );

    appPage
        .classList
        .add(
            "hidden"
        );

}


function showAppPage(){

    loginPage
        .classList
        .add(
            "hidden"
        );

    appPage
        .classList
        .remove(
            "hidden"
        );

}


function formatDateTime(
    value
){

    if(
        !value
    ){

        return "-";

    }

    const date =
        new Date(
            value
        );

    if(
        Number.isNaN(
            date.getTime()
        )
    ){

        return String(
            value
        );

    }

    return date.toLocaleString(
        "zh-CN",
        {

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit"

        }
    );

}


function displayValue(
    value
){

    if(
        value === null ||
        value === undefined ||
        value === ""
    ){

        return "-";

    }

    if(
        value === true
    ){

        return "是";

    }

    if(
        value === false
    ){

        return "否";

    }

    return String(
        value
    );

}


// ============================================================
// CSV
// ============================================================

function csvEscape(
    value
){

    if(
        value === null ||
        value === undefined
    ){

        return "";

    }

    let text =
        String(
            value
        );

    if(
        text.includes(",") ||
        text.includes('"') ||
        text.includes("\n") ||
        text.includes("\r")
    ){

        text =
            '"' +
            text.replace(
                /"/g,
                '""'
            ) +
            '"';

    }

    return text;

}


function makeCSVText(
    headers,
    rows
){

    const csvLines =
        [];

    csvLines.push(
        headers
            .map(
                csvEscape
            )
            .join(",")
    );

    rows.forEach(
        row=>{

            csvLines.push(
                headers
                    .map(
                        header=>
                            csvEscape(
                                row[
                                    header
                                ]
                            )
                    )
                    .join(",")
            );

        }
    );

    return (
        "\uFEFF" +
        csvLines.join(
            "\r\n"
        )
    );

}


function downloadCSV(
    filename,
    headers,
    rows
){

    const csv =
        makeCSVText(
            headers,
            rows
        );

    const blob =
        new Blob(
            [
                csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        filename;

    document.body
        .appendChild(
            link
        );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// Authentication
// ============================================================

async function login(){

    loginError.textContent =
        "";

    const email =
        emailInput
            .value
            .trim();

    const password =
        passwordInput
            .value;

    if(
        !email ||
        !password
    ){

        loginError.textContent =
            "请输入邮箱和密码。";

        return;

    }

    loginButton.disabled =
        true;

    loginButton.textContent =
        "正在登录...";

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .signInWithPassword({

                    email:
                        email,

                    password:
                        password

                });

        if(
            error
        ){

            throw error;

        }

        const isAdmin =
            await checkCurrentUserIsAdmin();

        if(
            !isAdmin
        ){

            await supabaseClient
                .auth
                .signOut();

            loginError.textContent =
                "该账号没有管理员权限。";

            return;

        }

        await enterAdminApp(
            data.user
        );

    }
    catch(error){

        console.error(
            "Login failed:",
            error
        );

        loginError.textContent =
            "登录失败，请检查邮箱和密码。";

    }
    finally{

        loginButton.disabled =
            false;

        loginButton.textContent =
            "登录";

    }

}


async function logout(){

    try{

        await supabaseClient
            .auth
            .signOut();

    }
    catch(error){

        console.error(
            error
        );

    }

    selectedSubjects.clear();

    allSessions =
        [];

    filteredSessions =
        [];

    subjectOverviewRows =
        [];

    currentSubjectRows =
        [];

    currentDetailSession =
        null;

    currentDetailRows =
        [];

    emailInput.value =
        "";

    passwordInput.value =
        "";

    showLoginPage();

}


async function checkCurrentUserIsAdmin(){

    const {
        data: userData,
        error: userError
    } =
        await supabaseClient
            .auth
            .getUser();

    if(
        userError ||
        !userData.user
    ){

        return false;

    }

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "admin_users"
            )
            .select(
                "user_id"
            )
            .eq(
                "user_id",
                userData.user.id
            )
            .maybeSingle();

    if(
        error
    ){

        console.error(
            error
        );

        return false;

    }

    return Boolean(
        data
    );

}


async function restoreSession(){

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();

        if(
            error
        ){

            throw error;

        }

        if(
            !data.session
        ){

            showLoginPage();

            return;

        }

        const isAdmin =
            await checkCurrentUserIsAdmin();

        if(
            !isAdmin
        ){

            await supabaseClient
                .auth
                .signOut();

            showLoginPage();

            return;

        }

        await enterAdminApp(
            data.session.user
        );

    }
    catch(error){

        console.error(
            error
        );

        showLoginPage();

    }

}


async function enterAdminApp(
    user
){

    adminEmail.textContent =
        user.email || "";

    showAppPage();

    await loadSessions();

}


// ============================================================
// Load Session QC View
// ============================================================

async function loadSessions(){

    setLoading(
        true,
        "正在加载 Session..."
    );

    dataStatus.textContent =
        "正在加载数据...";

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "task_sessions_qc"
                )
                .select("*")
                .order(
                    "started_at",
                    {
                        ascending:
                            false
                    }
                );

        if(
            error
        ){

            throw error;

        }

        allSessions =
            data || [];

        selectedSubjects.clear();

        buildSessionFlags();

        buildSubjectOverview();

        updateSummary();

        applyFilters();

        updateSelectionUI();

    }
    catch(error){

        console.error(
            "Failed to load sessions:",
            error
        );

        dataStatus.textContent =
            "数据加载失败，请检查 Supabase 权限。";

    }
    finally{

        setLoading(
            false
        );

    }

}


// ============================================================
// Session Flags
// ============================================================

function buildSessionFlags(){

    const counts =
        {};

    allSessions.forEach(
        session=>{

            const key =
                normalizeSubject(
                    session.subject
                )
                +
                "__"
                +
                session.task;

            counts[
                key
            ] =
                (
                    counts[
                        key
                    ] || 0
                )
                + 1;

        }
    );

    allSessions.forEach(
        session=>{

            const key =
                normalizeSubject(
                    session.subject
                )
                +
                "__"
                +
                session.task;

            session.session_count =
                counts[
                    key
                ] || 1;

            session.is_duplicate =
                session.session_count >
                1;

        }
    );

}


// ============================================================
// Subject Overview
// ============================================================

function buildSubjectOverview(){

    const map =
        {};

    allSessions.forEach(
        session=>{

            const subject =
                String(
                    session.subject || ""
                ).trim();

            if(
                !subject
            ){

                return;

            }

            const key =
                normalizeSubject(
                    subject
                );

            if(
                !map[
                    key
                ]
            ){

                map[
                    key
                ] = {

                    subject:
                        subject,

                    subject_key:
                        key,

                    sst_sessions:
                        [],

                    beads_sessions:
                        []

                };

            }

            if(
                session.task ===
                "SST"
            ){

                map[
                    key
                ]
                    .sst_sessions
                    .push(
                        session
                    );

            }

            if(
                session.task ===
                "Beads"
            ){

                map[
                    key
                ]
                    .beads_sessions
                    .push(
                        session
                    );

            }

        }
    );

    subjectOverviewRows =
        Object.values(
            map
        )
        .map(
            item=>{

                const sstCompleted =
                    item.sst_sessions
                        .some(
                            s=>
                                s.completed ===
                                true
                        );

                const beadsCompleted =
                    item.beads_sessions
                        .some(
                            s=>
                                s.completed ===
                                true
                        );

                const sstQC =
                    item.sst_sessions
                        .some(
                            s=>
                                s.qc_status ===
                                "ok"
                        );

                const beadsQC =
                    item.beads_sessions
                        .some(
                            s=>
                                s.qc_status ===
                                "ok"
                        );

                const hasAbnormal =
                    [
                        ...item.sst_sessions,
                        ...item.beads_sessions
                    ]
                    .some(
                        s=>
                            s.qc_status ===
                            "abnormal"
                    );

                return {

                    subject:
                        item.subject,

                    subject_key:
                        item.subject_key,

                    sst_count:
                        item.sst_sessions.length,

                    sst_completed:
                        sstCompleted,

                    sst_qc_ok:
                        sstQC,

                    beads_count:
                        item.beads_sessions.length,

                    beads_completed:
                        beadsCompleted,

                    beads_qc_ok:
                        beadsQC,

                    all_completed:
                        sstCompleted &&
                        beadsCompleted,

                    all_qc_ok:
                        sstQC &&
                        beadsQC,

                    has_abnormal:
                        hasAbnormal

                };

            }
        );

    subjectOverviewRows.sort(
        (
            a,
            b
        )=>
            a.subject.localeCompare(
                b.subject
            )
    );

}


// ============================================================
// Summary
// ============================================================

function updateSummary(){

    document
        .getElementById(
            "summary-total"
        )
        .textContent =
            allSessions.length;

    document
        .getElementById(
            "summary-sst"
        )
        .textContent =
            allSessions
                .filter(
                    s=>
                        s.task ===
                        "SST"
                )
                .length;

    document
        .getElementById(
            "summary-beads"
        )
        .textContent =
            allSessions
                .filter(
                    s=>
                        s.task ===
                        "Beads"
                )
                .length;

    document
        .getElementById(
            "summary-incomplete"
        )
        .textContent =
            allSessions
                .filter(
                    s=>
                        s.completed !==
                        true
                )
                .length;

}


// ============================================================
// Filters
// ============================================================

function applyFilters(){

    updateBatchToolbarVisibility();

    if(
        viewMode.value ===
        "subject"
    ){

        renderSubjectTable();

        updateSelectionUI();

        return;

    }

    const search =
        subjectSearch
            .value
            .trim()
            .toLowerCase();

    const task =
        taskFilter.value;

    const status =
        statusFilter.value;

    filteredSessions =
        allSessions.filter(
            session=>{

                const subject =
                    normalizeSubject(
                        session.subject
                    );

                if(
                    search &&
                    !subject.includes(
                        search
                    )
                ){

                    return false;

                }

                if(
                    task !==
                    "all" &&
                    session.task !==
                    task
                ){

                    return false;

                }

                if(
                    status ===
                    "completed" &&
                    session.completed !==
                    true
                ){

                    return false;

                }

                if(
                    status ===
                    "incomplete" &&
                    session.completed ===
                    true
                ){

                    return false;

                }

                return true;

            }
        );

    renderSessionTable();

    dataStatus.textContent =
        "显示 " +
        filteredSessions.length +
        " / " +
        allSessions.length +
        " 个 Session。";

}


// ============================================================
// Session Table
// ============================================================

function renderSessionTable(){

    const tableHead =
        document.querySelector(
            "#session-table thead tr"
        );

    tableHead.innerHTML = `

        <th>被试编号</th>
        <th>任务</th>
        <th>版本</th>
        <th>开始时间</th>
        <th>完成时间</th>
        <th>状态</th>
        <th>数据完整度</th>
        <th>QC</th>
        <th>操作</th>

    `;

    sessionTableBody.innerHTML =
        "";

    if(
        filteredSessions.length ===
        0
    ){

        const tr =
            document.createElement(
                "tr"
            );

        tr.innerHTML =
            `
            <td
                colspan="9"
                class="empty-cell"
            >
                没有符合条件的数据
            </td>
            `;

        sessionTableBody
            .appendChild(
                tr
            );

        return;

    }

    filteredSessions.forEach(
        session=>{

            const tr =
                document.createElement(
                    "tr"
                );


            // Subject

            const subjectTd =
                document.createElement(
                    "td"
                );

            subjectTd.textContent =
                displayValue(
                    session.subject
                );

            tr.appendChild(
                subjectTd
            );


            // Task

            const taskTd =
                document.createElement(
                    "td"
                );

            const taskBadge =
                document.createElement(
                    "span"
                );

            taskBadge.className =
                session.task ===
                "SST"
                    ?
                    "task-badge task-sst"
                    :
                    "task-badge task-beads";

            taskBadge.textContent =
                session.task;

            taskTd.appendChild(
                taskBadge
            );

            tr.appendChild(
                taskTd
            );


            // Version

            const versionTd =
                document.createElement(
                    "td"
                );

            versionTd.textContent =
                displayValue(
                    session.task_version
                );

            tr.appendChild(
                versionTd
            );


            // Start

            const startTd =
                document.createElement(
                    "td"
                );

            startTd.textContent =
                formatDateTime(
                    session.started_at
                );

            tr.appendChild(
                startTd
            );


            // Complete

            const completeTd =
                document.createElement(
                    "td"
                );

            completeTd.textContent =
                formatDateTime(
                    session.completed_at
                );

            tr.appendChild(
                completeTd
            );


            // Status

            const statusTd =
                document.createElement(
                    "td"
                );

            const statusBadge =
                document.createElement(
                    "span"
                );

            if(
                session.completed
            ){

                statusBadge.className =
                    "status-badge status-completed";

                statusBadge.textContent =
                    "已完成";

            }
            else{

                statusBadge.className =
                    "status-badge status-incomplete";

                statusBadge.textContent =
                    "未完成";

            }

            statusTd.appendChild(
                statusBadge
            );

            tr.appendChild(
                statusTd
            );


            // Completeness

            const completenessTd =
                document.createElement(
                    "td"
                );

            completenessTd.textContent =
                displayValue(
                    session.data_count
                )
                +
                " / "
                +
                displayValue(
                    session.expected_count
                );

            tr.appendChild(
                completenessTd
            );


            // QC

            const qcTd =
                document.createElement(
                    "td"
                );

            const qcBadge =
                document.createElement(
                    "span"
                );

            if(
                session.qc_status ===
                "ok"
            ){

                qcBadge.className =
                    "qc-badge qc-ok";

                qcBadge.textContent =
                    "正常";

            }
            else if(
                session.qc_status ===
                "abnormal"
            ){

                qcBadge.className =
                    "qc-badge qc-abnormal";

                qcBadge.textContent =
                    "异常";

            }
            else{

                qcBadge.className =
                    "qc-badge qc-warning";

                qcBadge.textContent =
                    "未完成";

            }

            qcTd.appendChild(
                qcBadge
            );

            if(
                session.is_duplicate
            ){

                const duplicateBadge =
                    document.createElement(
                        "span"
                    );

                duplicateBadge.className =
                    "qc-badge qc-duplicate";

                duplicateBadge.textContent =
                    "重复 ×" +
                    session.session_count;

                qcTd.appendChild(
                    duplicateBadge
                );

            }

            tr.appendChild(
                qcTd
            );


            // Action

            const actionTd =
                document.createElement(
                    "td"
                );

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "table-button";

            button.textContent =
                "查看详情";

            button.addEventListener(
                "click",
                ()=>{

                    openSessionDetail(
                        session
                    );

                }
            );

            actionTd.appendChild(
                button
            );

            tr.appendChild(
                actionTd
            );


            sessionTableBody
                .appendChild(
                    tr
                );

        }
    );

}


// ============================================================
// Subject Table
// ============================================================

function getFilteredSubjectRows(){

    const search =
        subjectSearch
            .value
            .trim()
            .toLowerCase();

    const task =
        taskFilter.value;

    const status =
        statusFilter.value;

    return subjectOverviewRows
        .filter(
            row=>{

                if(
                    search &&
                    !row.subject_key
                        .includes(
                            search
                        )
                ){

                    return false;

                }

                if(
                    task ===
                    "SST" &&
                    row.sst_count ===
                    0
                ){

                    return false;

                }

                if(
                    task ===
                    "Beads" &&
                    row.beads_count ===
                    0
                ){

                    return false;

                }

                if(
                    status ===
                    "completed"
                ){

                    if(
                        task ===
                        "SST"
                    ){

                        return row.sst_completed;

                    }

                    if(
                        task ===
                        "Beads"
                    ){

                        return row.beads_completed;

                    }

                    return row.all_completed;

                }

                if(
                    status ===
                    "incomplete"
                ){

                    if(
                        task ===
                        "SST"
                    ){

                        return !row.sst_completed;

                    }

                    if(
                        task ===
                        "Beads"
                    ){

                        return !row.beads_completed;

                    }

                    return !row.all_completed;

                }

                return true;

            }
        );

}


function renderSubjectTable(){

    const tableHead =
        document.querySelector(
            "#session-table thead tr"
        );

    const task =
        taskFilter.value;


    // ========================================================
    // Dynamic Header
    // ========================================================

    if(
        task ===
        "SST"
    ){

        tableHead.innerHTML = `

            <th class="checkbox-column">
                选择
            </th>

            <th>
                被试编号
            </th>

            <th>
                SST
            </th>

            <th>
                SST Session数
            </th>

            <th>
                SST QC
            </th>

        `;

    }
    else if(
        task ===
        "Beads"
    ){

        tableHead.innerHTML = `

            <th class="checkbox-column">
                选择
            </th>

            <th>
                被试编号
            </th>

            <th>
                Beads
            </th>

            <th>
                Beads Session数
            </th>

            <th>
                Beads QC
            </th>

        `;

    }
    else{

        tableHead.innerHTML = `

            <th class="checkbox-column">
                选择
            </th>

            <th>
                被试编号
            </th>

            <th>
                SST
            </th>

            <th>
                SST Session数
            </th>

            <th>
                Beads
            </th>

            <th>
                Beads Session数
            </th>

            <th>
                总体QC
            </th>

        `;

    }


    sessionTableBody.innerHTML =
        "";


    currentSubjectRows =
        getFilteredSubjectRows();


    dataStatus.textContent =
        "显示 " +
        currentSubjectRows.length +
        " / " +
        subjectOverviewRows.length +
        " 个被试。";


    // ========================================================
    // Empty
    // ========================================================

    if(
        currentSubjectRows.length ===
        0
    ){

        const tr =
            document.createElement(
                "tr"
            );

        const colspan =
            task === "all"
                ? 7
                : 5;

        tr.innerHTML = `

            <td
                colspan="${colspan}"
                class="empty-cell"
            >
                没有符合条件的被试
            </td>

        `;

        sessionTableBody
            .appendChild(
                tr
            );

        return;

    }


    // ========================================================
    // Rows
    // ========================================================

    currentSubjectRows.forEach(
        item=>{

            const tr =
                document.createElement(
                    "tr"
                );


            // =================================================
            // Checkbox
            // =================================================

            const checkboxTd =
                document.createElement(
                    "td"
                );

            checkboxTd.className =
                "checkbox-column";


            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.className =
                "subject-checkbox";

            checkbox.checked =
                selectedSubjects.has(
                    item.subject_key
                );


            checkbox.addEventListener(
                "change",
                ()=>{

                    if(
                        checkbox.checked
                    ){

                        selectedSubjects.add(
                            item.subject_key
                        );

                    }
                    else{

                        selectedSubjects.delete(
                            item.subject_key
                        );

                    }

                    updateSelectionUI();

                }
            );


            checkboxTd.appendChild(
                checkbox
            );

            tr.appendChild(
                checkboxTd
            );


            // =================================================
            // Subject
            // =================================================

            const subjectTd =
                document.createElement(
                    "td"
                );

            subjectTd.textContent =
                item.subject;

            tr.appendChild(
                subjectTd
            );


            // =================================================
            // SST ONLY
            // =================================================

            if(
                task ===
                "SST"
            ){

                const sstTd =
                    document.createElement(
                        "td"
                    );

                sstTd.appendChild(
                    buildSubjectTaskBadge(
                        item.sst_count,
                        item.sst_qc_ok,
                        item.sst_completed
                    )
                );

                tr.appendChild(
                    sstTd
                );


                const countTd =
                    document.createElement(
                        "td"
                    );

                countTd.textContent =
                    item.sst_count;

                tr.appendChild(
                    countTd
                );


                const qcTd =
                    document.createElement(
                        "td"
                    );

                const qcBadge =
                    document.createElement(
                        "span"
                    );


                if(
                    item.sst_qc_ok
                ){

                    qcBadge.className =
                        "qc-badge qc-ok";

                    qcBadge.textContent =
                        "正常";

                }
                else if(
                    item.sst_count ===
                    0
                ){

                    qcBadge.className =
                        "status-badge status-missing";

                    qcBadge.textContent =
                        "无数据";

                }
                else if(
                    item.sst_completed
                ){

                    qcBadge.className =
                        "qc-badge qc-abnormal";

                    qcBadge.textContent =
                        "异常";

                }
                else{

                    qcBadge.className =
                        "qc-badge qc-warning";

                    qcBadge.textContent =
                        "未完整";

                }


                qcTd.appendChild(
                    qcBadge
                );

                tr.appendChild(
                    qcTd
                );

            }


            // =================================================
            // BEADS ONLY
            // =================================================

            else if(
                task ===
                "Beads"
            ){

                const beadsTd =
                    document.createElement(
                        "td"
                    );

                beadsTd.appendChild(
                    buildSubjectTaskBadge(
                        item.beads_count,
                        item.beads_qc_ok,
                        item.beads_completed
                    )
                );

                tr.appendChild(
                    beadsTd
                );


                const countTd =
                    document.createElement(
                        "td"
                    );

                countTd.textContent =
                    item.beads_count;

                tr.appendChild(
                    countTd
                );


                const qcTd =
                    document.createElement(
                        "td"
                    );

                const qcBadge =
                    document.createElement(
                        "span"
                    );


                if(
                    item.beads_qc_ok
                ){

                    qcBadge.className =
                        "qc-badge qc-ok";

                    qcBadge.textContent =
                        "正常";

                }
                else if(
                    item.beads_count ===
                    0
                ){

                    qcBadge.className =
                        "status-badge status-missing";

                    qcBadge.textContent =
                        "无数据";

                }
                else if(
                    item.beads_completed
                ){

                    qcBadge.className =
                        "qc-badge qc-abnormal";

                    qcBadge.textContent =
                        "异常";

                }
                else{

                    qcBadge.className =
                        "qc-badge qc-warning";

                    qcBadge.textContent =
                        "未完整";

                }


                qcTd.appendChild(
                    qcBadge
                );

                tr.appendChild(
                    qcTd
                );

            }


            // =================================================
            // ALL TASKS
            // =================================================

            else{

                // SST

                const sstTd =
                    document.createElement(
                        "td"
                    );

                sstTd.appendChild(
                    buildSubjectTaskBadge(
                        item.sst_count,
                        item.sst_qc_ok,
                        item.sst_completed
                    )
                );

                tr.appendChild(
                    sstTd
                );


                const sstCountTd =
                    document.createElement(
                        "td"
                    );

                sstCountTd.textContent =
                    item.sst_count;

                tr.appendChild(
                    sstCountTd
                );


                // Beads

                const beadsTd =
                    document.createElement(
                        "td"
                    );

                beadsTd.appendChild(
                    buildSubjectTaskBadge(
                        item.beads_count,
                        item.beads_qc_ok,
                        item.beads_completed
                    )
                );

                tr.appendChild(
                    beadsTd
                );


                const beadsCountTd =
                    document.createElement(
                        "td"
                    );

                beadsCountTd.textContent =
                    item.beads_count;

                tr.appendChild(
                    beadsCountTd
                );


                // Overall QC

                const overallTd =
                    document.createElement(
                        "td"
                    );

                const badge =
                    document.createElement(
                        "span"
                    );


                if(
                    item.all_qc_ok
                ){

                    badge.className =
                        "qc-badge qc-ok";

                    badge.textContent =
                        "全部正常";

                }
                else if(
                    item.has_abnormal
                ){

                    badge.className =
                        "qc-badge qc-abnormal";

                    badge.textContent =
                        "存在异常";

                }
                else{

                    badge.className =
                        "qc-badge qc-warning";

                    badge.textContent =
                        "数据不完整";

                }


                overallTd.appendChild(
                    badge
                );

                tr.appendChild(
                    overallTd
                );

            }


            sessionTableBody.appendChild(
                tr
            );

        }
    );

}


function buildSubjectTaskBadge(
    count,
    qcOK,
    completed
){

    const badge =
        document.createElement(
            "span"
        );

    if(
        count ===
        0
    ){

        badge.className =
            "status-badge status-missing";

        badge.textContent =
            "无数据";

    }
    else if(
        qcOK
    ){

        badge.className =
            "qc-badge qc-ok";

        badge.textContent =
            "正常";

    }
    else if(
        completed
    ){

        badge.className =
            "qc-badge qc-abnormal";

        badge.textContent =
            "异常";

    }
    else{

        badge.className =
            "qc-badge qc-warning";

        badge.textContent =
            "未完整";

    }

    return badge;

}


// ============================================================
// Batch Selection UI
// ============================================================

function updateBatchToolbarVisibility(){

    if(
        viewMode.value ===
        "subject"
    ){

        batchToolbar
            .classList
            .remove(
                "hidden"
            );

    }
    else{

        batchToolbar
            .classList
            .add(
                "hidden"
            );

    }

}


function updateSelectionUI(){

    selectionCount.textContent =
        "已选择 " +
        selectedSubjects.size +
        " 个被试";

    batchDownloadButton.disabled =
        selectedSubjects.size ===
        0;

    if(
        taskFilter.value ===
        "SST"
    ){

        batchDownloadHint.textContent =
            "下载范围：仅 SST";

    }
    else if(
        taskFilter.value ===
        "Beads"
    ){

        batchDownloadHint.textContent =
            "下载范围：仅 Beads";

    }
    else{

        batchDownloadHint.textContent =
            "下载范围：SST + Beads";

    }

}


function selectAllCurrentSubjects(){

    currentSubjectRows.forEach(
        row=>{

            selectedSubjects.add(
                row.subject_key
            );

        }
    );

    renderSubjectTable();

    updateSelectionUI();

}


function clearSubjectSelection(){

    selectedSubjects.clear();

    renderSubjectTable();

    updateSelectionUI();

}


// ============================================================
// Batch ZIP Download
// ============================================================

async function batchDownloadSelectedSubjects(){

    if(
        selectedSubjects.size ===
        0
    ){

        alert(
            "请先选择至少一个被试。"
        );

        return;

    }

    if(
        typeof JSZip ===
        "undefined"
    ){

        alert(
            "ZIP 模块未加载，请刷新页面后重试。"
        );

        return;

    }


    const selectedTask =
        taskFilter.value;


    const selectedSessionRows =
        allSessions.filter(
            session=>{

                const subjectKey =
                    normalizeSubject(
                        session.subject
                    );

                if(
                    !selectedSubjects.has(
                        subjectKey
                    )
                ){

                    return false;

                }

                if(
                    selectedTask !==
                    "all" &&
                    session.task !==
                    selectedTask
                ){

                    return false;

                }

                return true;

            }
        );


    if(
        selectedSessionRows.length ===
        0
    ){

        alert(
            "所选被试在当前任务范围内没有可下载的数据。"
        );

        return;

    }


    setLoading(
        true,
        "正在准备批量数据..."
    );


    try{

        const zip =
            new JSZip();


        let fileCount =
            0;


        let finished =
            0;


        for(
            const session of
            selectedSessionRows
        ){

            finished++;

            setLoading(
                true,
                "正在读取数据 " +
                finished +
                " / " +
                selectedSessionRows.length
            );


            let rows;


            if(
                session.task ===
                "SST"
            ){

                rows =
                    await fetchSSTSessionRows(
                        session.session_id
                    );

            }
            else{

                rows =
                    await fetchBeadsSessionRows(
                        session.session_id
                    );

            }


            // Even if rows = 0,
            // we skip empty file.

            if(
                rows.length ===
                0
            ){

                continue;

            }


            const subjectFolder =
                safeFilename(
                    session.subject
                );


            const taskFolder =
                session.task;


            const folder =
                zip.folder(
                    subjectFolder +
                    "/" +
                    taskFolder
                );


            let headers;


            if(
                session.task ===
                "SST"
            ){

                headers =
                    getSSTCSVHeaders();

            }
            else{

                headers =
                    getBeadsCSVHeaders();

            }


            const csv =
                makeCSVText(
                    headers,
                    rows
                );


            const version =
                session.task_version
                    ?
                    safeFilename(
                        session.task_version
                    )
                    :
                    "unknown";


            const filename =
                safeFilename(
                    session.subject
                )
                +
                "_"
                +
                session.task
                +
                "_v"
                +
                version
                +
                "_"
                +
                shortSessionID(
                    session.session_id
                )
                +
                ".csv";


            folder.file(
                filename,
                csv
            );


            fileCount++;

        }


        if(
            fileCount ===
            0
        ){

            alert(
                "所选数据没有可导出的明细记录。"
            );

            return;

        }


        setLoading(
            true,
            "正在生成 ZIP..."
        );


        const blob =
            await zip.generateAsync(
                {
                    type:
                        "blob"
                }
            );


        const taskLabel =
            selectedTask ===
            "all"
                ?
                "AllTasks"
                :
                selectedTask;


        const zipName =
            "OCD_"
            +
            taskLabel
            +
            "_SelectedSubjects_"
            +
            getDateStamp()
            +
            ".zip";


        downloadBlob(
            blob,
            zipName
        );

    }
    catch(error){

        console.error(
            "Batch download failed:",
            error
        );

        alert(
            "批量下载失败，请打开控制台查看错误。"
        );

    }
    finally{

        setLoading(
            false
        );

    }

}


function downloadBlob(
    blob,
    filename
){

    const url =
        URL.createObjectURL(
            blob
        );

    const link =
        document.createElement(
            "a"
        );

    link.href =
        url;

    link.download =
        filename;

    document.body
        .appendChild(
            link
        );

    link.click();

    link.remove();

    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// Fetch Individual Session Data
// ============================================================

async function fetchSSTSessionRows(
    sessionID
){

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "sst_trials"
            )
            .select("*")
            .eq(
                "session_id",
                sessionID
            )
            .order(
                "trial_timestamp",
                {
                    ascending:
                        true
                }
            );

    if(
        error
    ){

        throw error;

    }

    return data || [];

}


async function fetchBeadsSessionRows(
    sessionID
){

    const {
        data,
        error
    } =
        await supabaseClient
            .from(
                "beads_draws"
            )
            .select("*")
            .eq(
                "session_id",
                sessionID
            )
            .order(
                "trial",
                {
                    ascending:
                        true
                }
            )
            .order(
                "bead_index",
                {
                    ascending:
                        true
                }
            );

    if(
        error
    ){

        throw error;

    }

    return data || [];

}


// ============================================================
// CSV Headers
// ============================================================

function getSSTCSVHeaders(){

    return [

        "session_id",
        "subject",
        "phase",
        "practice_attempt",
        "block",
        "trial",
        "type",
        "direction",
        "response",
        "rt",
        "accuracy",
        "choice_error",
        "go_omission",
        "ssd",
        "stop_success",
        "premature_response",
        "trial_timestamp"

    ];

}


function getBeadsCSVHeaders(){

    return [

        "session_id",
        "subject",
        "trial",
        "ratio",
        "bead_index",
        "bead_color",
        "q1_response",
        "q1_rt",
        "q2_probability",
        "q2_rt",
        "q3_sufficient",
        "q3_rt",
        "dtd",
        "final_jar",
        "correct_jar",
        "is_correct",
        "is_jtc_bias",
        "dt",
        "frt_ms",
        "trial_timestamp"

    ];

}


// ============================================================
// Session Detail
// ============================================================

async function openSessionDetail(
    session
){

    currentDetailSession =
        session;

    currentDetailRows =
        [];

    detailTitle.textContent =
        session.task +
        " · " +
        session.subject;

    detailSubtitle.textContent =
        "Session ID: " +
        session.session_id;

    detailInfo.innerHTML =
        "";

    const infoItems = [

        [
            "任务",
            session.task
        ],

        [
            "版本",
            displayValue(
                session.task_version
            )
        ],

        [
            "被试编号",
            session.subject
        ],

        [
            "开始时间",
            formatDateTime(
                session.started_at
            )
        ],

        [
            "完成时间",
            formatDateTime(
                session.completed_at
            )
        ],

        [
            "数据完整度",
            session.data_count +
            " / " +
            session.expected_count
        ],

        [
            "QC",
            session.qc_status
        ]

    ];

    infoItems.forEach(
        item=>{

            const box =
                document.createElement(
                    "div"
                );

            box.className =
                "detail-info-item";

            const label =
                document.createElement(
                    "div"
                );

            label.className =
                "detail-info-label";

            label.textContent =
                item[
                    0
                ];

            const value =
                document.createElement(
                    "div"
                );

            value.className =
                "detail-info-value";

            value.textContent =
                item[
                    1
                ];

            box.append(
                label,
                value
            );

            detailInfo.appendChild(
                box
            );

        }
    );

    detailModal
        .classList
        .remove(
            "hidden"
        );

    setLoading(
        true,
        "正在加载 Session 明细..."
    );

    try{

        if(
            session.task ===
            "SST"
        ){

            currentDetailRows =
                await fetchSSTSessionRows(
                    session.session_id
                );

            renderDetailTable(
                getSSTDetailColumns(),
                currentDetailRows
            );

        }
        else{

            currentDetailRows =
                await fetchBeadsSessionRows(
                    session.session_id
                );

            renderDetailTable(
                getBeadsDetailColumns(),
                currentDetailRows
            );

        }

    }
    catch(error){

        console.error(
            error
        );

    }
    finally{

        setLoading(
            false
        );

    }

}


function getSSTDetailColumns(){

    return [

        ["phase", "阶段"],
        ["practice_attempt", "练习次数"],
        ["block", "Block"],
        ["trial", "Trial"],
        ["type", "类型"],
        ["direction", "方向"],
        ["response", "反应"],
        ["rt", "RT"],
        ["accuracy", "正确"],
        ["choice_error", "Choice Error"],
        ["go_omission", "Go Omission"],
        ["ssd", "SSD"],
        ["stop_success", "Stop Success"],
        ["premature_response", "Premature"],
        ["trial_timestamp", "时间"]

    ];

}


function getBeadsDetailColumns(){

    return [

        ["trial", "Trial"],
        ["ratio", "比例"],
        ["bead_index", "珠子"],
        ["bead_color", "颜色"],
        ["q1_response", "Q1"],
        ["q1_rt", "Q1 RT"],
        ["q2_probability", "Q2概率"],
        ["q2_rt", "Q2 RT"],
        ["q3_sufficient", "Q3"],
        ["q3_rt", "Q3 RT"],
        ["dtd", "DTD"],
        ["final_jar", "最终判断"],
        ["correct_jar", "正确罐子"],
        ["is_correct", "正确"],
        ["is_jtc_bias", "JTC"],
        ["dt", "DT"],
        ["frt_ms", "FRT"],
        ["trial_timestamp", "时间"]

    ];

}


function renderDetailTable(
    columns,
    rows
){

    detailTableHead.innerHTML =
        "";

    detailTableBody.innerHTML =
        "";

    const headRow =
        document.createElement(
            "tr"
        );

    columns.forEach(
        column=>{

            const th =
                document.createElement(
                    "th"
                );

            th.textContent =
                column[
                    1
                ];

            headRow.appendChild(
                th
            );

        }
    );

    detailTableHead.appendChild(
        headRow
    );

    if(
        rows.length ===
        0
    ){

        const tr =
            document.createElement(
                "tr"
            );

        const td =
            document.createElement(
                "td"
            );

        td.colSpan =
            columns.length;

        td.className =
            "empty-cell";

        td.textContent =
            "该 Session 暂无明细数据";

        tr.appendChild(
            td
        );

        detailTableBody.appendChild(
            tr
        );

        return;

    }

    rows.forEach(
        dataRow=>{

            const tr =
                document.createElement(
                    "tr"
                );

            columns.forEach(
                column=>{

                    const field =
                        column[
                            0
                        ];

                    const td =
                        document.createElement(
                            "td"
                        );

                    td.textContent =
                        field ===
                        "trial_timestamp"
                            ?
                            formatDateTime(
                                dataRow[
                                    field
                                ]
                            )
                            :
                            displayValue(
                                dataRow[
                                    field
                                ]
                            );

                    tr.appendChild(
                        td
                    );

                }
            );

            detailTableBody.appendChild(
                tr
            );

        }
    );

}


function closeDetail(){

    detailModal
        .classList
        .add(
            "hidden"
        );

    currentDetailSession =
        null;

    currentDetailRows =
        [];

}


// ============================================================
// Existing Exports
// ============================================================

function exportCurrentSession(){

    if(
        !currentDetailSession ||
        currentDetailRows.length ===
        0
    ){

        alert(
            "当前没有可导出的数据。"
        );

        return;

    }

    const headers =
        currentDetailSession.task ===
        "SST"
            ?
            getSSTCSVHeaders()
            :
            getBeadsCSVHeaders();

    downloadCSV(

        safeFilename(
            currentDetailSession.subject
        )
        +
        "_"
        +
        currentDetailSession.task
        +
        ".csv",

        headers,

        currentDetailRows

    );

}


function exportCurrentList(){

    if(
        viewMode.value ===
        "subject"
    ){

        if(
            currentSubjectRows.length ===
            0
        ){

            return;

        }

        const headers = [

            "subject",
            "sst_count",
            "sst_completed",
            "sst_qc_ok",
            "beads_count",
            "beads_completed",
            "beads_qc_ok",
            "all_completed",
            "all_qc_ok",
            "has_abnormal"

        ];

        downloadCSV(
            "subject_overview.csv",
            headers,
            currentSubjectRows
        );

        return;

    }

    if(
        filteredSessions.length ===
        0
    ){

        return;

    }

    const headers = [

        "session_id",
        "subject",
        "task",
        "task_version",
        "started_at",
        "completed_at",
        "completed",
        "data_count",
        "expected_count",
        "qc_status",
        "session_count",
        "is_duplicate"

    ];

    downloadCSV(
        "session_overview.csv",
        headers,
        filteredSessions
    );

}


async function exportAllSST(){

    setLoading(
        true,
        "正在读取全部 SST 数据..."
    );

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "sst_trials"
                )
                .select("*")
                .order(
                    "trial_timestamp",
                    {
                        ascending:
                            true
                    }
                );

        if(
            error
        ){

            throw error;

        }

        downloadCSV(
            "SST_all_trials.csv",
            getSSTCSVHeaders(),
            data || []
        );

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "SST 数据导出失败。"
        );

    }
    finally{

        setLoading(
            false
        );

    }

}


async function exportAllBeads(){

    setLoading(
        true,
        "正在读取全部 Beads 数据..."
    );

    try{

        const {
            data,
            error
        } =
            await supabaseClient
                .from(
                    "beads_draws"
                )
                .select("*")
                .order(
                    "trial_timestamp",
                    {
                        ascending:
                            true
                    }
                );

        if(
            error
        ){

            throw error;

        }

        downloadCSV(
            "Beads_all_draws.csv",
            getBeadsCSVHeaders(),
            data || []
        );

    }
    catch(error){

        console.error(
            error
        );

        alert(
            "Beads 数据导出失败。"
        );

    }
    finally{

        setLoading(
            false
        );

    }

}


// ============================================================
// Events
// ============================================================

loginButton.addEventListener(
    "click",
    login
);


passwordInput.addEventListener(
    "keydown",
    event=>{

        if(
            event.key ===
            "Enter"
        ){

            login();

        }

    }
);


emailInput.addEventListener(
    "keydown",
    event=>{

        if(
            event.key ===
            "Enter"
        ){

            passwordInput.focus();

        }

    }
);


logoutButton.addEventListener(
    "click",
    logout
);


refreshButton.addEventListener(
    "click",
    loadSessions
);


viewMode.addEventListener(
    "change",
    ()=>{

        selectedSubjects.clear();

        applyFilters();

        updateSelectionUI();

    }
);


subjectSearch.addEventListener(
    "input",
    applyFilters
);


taskFilter.addEventListener(
    "change",
    ()=>{

        selectedSubjects.clear();

        applyFilters();

        updateSelectionUI();

    }
);


statusFilter.addEventListener(
    "change",
    applyFilters
);


exportButton.addEventListener(
    "click",
    exportCurrentList
);


exportSSTButton.addEventListener(
    "click",
    exportAllSST
);


exportBeadsButton.addEventListener(
    "click",
    exportAllBeads
);


selectAllButton.addEventListener(
    "click",
    selectAllCurrentSubjects
);


clearSelectionButton.addEventListener(
    "click",
    clearSubjectSelection
);


batchDownloadButton.addEventListener(
    "click",
    batchDownloadSelectedSubjects
);


closeDetailButton.addEventListener(
    "click",
    closeDetail
);


downloadSessionButton.addEventListener(
    "click",
    exportCurrentSession
);


detailModal.addEventListener(
    "click",
    event=>{

        if(
            event.target ===
            detailModal
        ){

            closeDetail();

        }

    }
);


document.addEventListener(
    "keydown",
    event=>{

        if(
            event.key ===
            "Escape"
        ){

            closeDetail();

        }

    }
);


// ============================================================
// Start
// ============================================================

restoreSession();