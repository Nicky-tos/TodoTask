document.addEventListener("DOMContentLoaded", () => {
	const addTaskModal = document.querySelector('.add-task-modal');
	const confirmDeleteModal = document.querySelector('.confirm-delete-modal');
	const closeAddModalButton = document.querySelector('.close-add-modal');
	const closeDeleteModalButton = document.querySelector('.close-delete-modal');
	const openModalButton = document.querySelector('.add-button');
	const addTaskButton = document.querySelector('.add-task');
	const confirmDeleteButton = document.querySelector('.confirm-delete');
	const tasksList = document.querySelector('.tasks-list');
	const addTaskInput = document.querySelector('.add-task-input');
	const toggleThemeButton = document.querySelector('.toggle-theme');
	const toggleThemeImage = toggleThemeButton.children[0];
	const searchInput = document.querySelector('.search-input');
	const sortSelect = document.querySelector('.form-select');
	const allTasksCounter = document.querySelector('.all-tasks-counter');
	const activeTasksCounter = document.querySelector('.active-tasks-counter');
	const doneTasksCounter = document.querySelector('.done-tasks-counter');
	const deleteAllSwitchLabel = document.querySelector('.clear-all-switch');
	const deleteAllSwitch = document.querySelector('.clear-all-switch-input');
	const notificationArea = document.querySelector('.notification-area');

	let isDarkTheme = false;
	let tasks = [];

	let pendingDeleteId = null;
	let notificationTimer = null;
	let notificationTimeLeft = 5;
	
	const tasksURL = 'http://localhost:3000/tasks';

	isDarkTheme = document.documentElement.classList.contains('dark-theme');
    toggleThemeImage.src = isDarkTheme ? 'assets/images/sun.svg' : 'assets/images/crescent.svg';

	async function initial(){
		await loadTasks();
		updateStats();
		renderTasks();
	}

	function updateStats(){
		allTasksCounter.textContent = tasks.length;
		activeTasksCounter.textContent = tasks.filter(task => !task.completed).length;
		doneTasksCounter.textContent = tasks.filter(task => task.completed).length;
	}

	toggleThemeButton.addEventListener('click', () => {
		toggleTheme();
	})

	/**
	* Изменяет тему приложения и иконку кнопки, сохраняет тему в localStorage
	* @returns {void}
	*/
	function toggleTheme(){
		document.documentElement.classList.toggle('dark-theme');
		isDarkTheme = !isDarkTheme;
		localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
		toggleThemeImage.src = isDarkTheme ? 'assets/images/sun.svg':'assets/images/crescent.svg';
		
	}

	/**
	 * Загружает задачи из localStorage
	 * @returns {void}
	 */
	async function loadTasks(){
		try {
			const response = await axios.get(tasksURL);
			tasks = response.data;
		} catch {
			showAlert('Не получилось подключиться к серверу. Задачи загружены из локального хранилища');
			const savedTasks = localStorage.getItem('tasks');
			if (savedTasks){
				tasks = JSON.parse(savedTasks);
			}
		}
	}

	/**
	 * Фильтрация, поиск и отрисовывка заданий
	 * @returns {void}
	 */
	function renderTasks(){
		let visibleTasks = tasks.slice();

		const searchVal = searchInput.value.toLowerCase();
		if (searchVal) {
			visibleTasks = visibleTasks.filter( task => task.text.toLowerCase().includes(searchVal))
		}

		const filterVal = sortSelect.value;
		if (filterVal === "complete"){
			visibleTasks = visibleTasks.filter(task => task.completed);
		} else if (filterVal === "incomplete"){
			visibleTasks = visibleTasks.filter(task => !task.completed);
		}

		tasksList.innerHTML = '';
		if ( visibleTasks.length === 0 ) {

			tasksList.innerHTML = `<div class="empty-list">
				<img src="assets/images/empty-list-img.png" alt="Empty list">
				<span>Empty...</span>
			</div>`;
			return;
		}

		visibleTasks.forEach(task => {
			const taskEl = document.createElement('li');
			taskEl.dataset.id = task.id;
			taskEl.innerHTML = `<input class="form-checkbox task-checkbox" type="checkbox" name="completed" ${task.completed ? 'checked' : ''}>
			<span class="task-text">${task.text}</span>
			<div class="task-actions">
				<div class="edit-task pointer" style="margin-left: auto;">
					<svg width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M7.67272 3.49106L1 10.1637V13.5H4.33636L11.0091 6.82736M7.67272 3.49106L10.0654 1.09837L10.0669 1.09695C10.3962 0.767585 10.5612 0.602613 10.7514 0.540824C10.9189 0.486392 11.0993 0.486392 11.2669 0.540824C11.4569 0.602571 11.6217 0.767352 11.9506 1.09625L13.4018 2.54738C13.7321 2.87769 13.8973 3.04292 13.9592 3.23337C14.0136 3.40088 14.0136 3.58133 13.9592 3.74885C13.8974 3.93916 13.7324 4.10414 13.4025 4.43398L13.4018 4.43468L11.0091 6.82736M7.67272 3.49106L11.0091 6.82736" stroke="#CDCDCD" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
				<div class="delete-task pointer">
					<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M3.87426 7.61505C3.80724 6.74386 4.49607 6 5.36983 6H12.6302C13.504 6 14.1928 6.74385 14.1258 7.61505L13.6065 14.365C13.5464 15.1465 12.8948 15.75 12.1109 15.75H5.88907C5.10526 15.75 4.4536 15.1465 4.39348 14.365L3.87426 7.61505Z" stroke="#CDCDCD"/>
						<path d="M14.625 3.75H3.375" stroke="#CDCDCD" stroke-linecap="round"/>
						<path d="M7.5 2.25C7.5 1.83579 7.83577 1.5 8.25 1.5H9.75C10.1642 1.5 10.5 1.83579 10.5 2.25V3.75H7.5V2.25Z" stroke="#CDCDCD"/>
						<path d="M10.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
						<path d="M7.5 9V12.75" stroke="#CDCDCD" stroke-linecap="round"/>
					</svg>
				</div>
			</div>`;

			const taskCheckbox = taskEl.querySelector('.form-checkbox');
			taskCheckbox.addEventListener('change', () => toggleCompleteTask(task.id));

			const taskEditButton = taskEl.querySelector('.edit-task');
			taskEditButton.addEventListener('click', () => editTask(taskEl, task));

			const taskDeleteButton = taskEl.querySelector('.delete-task');
			taskDeleteButton.addEventListener('click', () => startTaskDeletion(task.id));

			tasksList.appendChild(taskEl);
		});
	}

	async function addTask(){
		const text = addTaskInput.value.trim();

		if (!text.length){
			showAlert("Something went wrong! Try adding more symbols", 'error')
			return;
		}

		const newTask = {
			id : Date.now(),
			text: text,
			completed: false
		}

		tasks.push(newTask);
		renderTasks();

		showAlert("Task added successfully", 'success');
		updateStats();
		closeModal(addTaskModal);
		await addTaskToServer(newTask);
		updateLocalStorage();

		addTaskInput.value = '';
	}

	/**
	 * 
	 * @param {number} id айдишник задания
	 * @returns {void}
	 */
	async function toggleCompleteTask(id){
		const task = tasks.find(task => task.id === id);
		if (task) {
			task.completed = !task.completed;
			await saveTaskToServer(task);
			updateLocalStorage();
			updateStats();
		}
	}

	function editTask(taskEl, task){
		const taskText = taskEl.querySelector('.task-text');
		const editTaskInput = document.createElement('input');
		editTaskInput.type = 'text';
		editTaskInput.className = 'form-input task-edit-input';
		editTaskInput.value = task.text;

		taskText.replaceWith(editTaskInput);
		editTaskInput.focus();

		editTaskInput.addEventListener('blur', () => {
			finishEditTask(task, editTaskInput.value);
		});
		
		editTaskInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				finishEditTask(task, editTaskInput.value);
			}
		});
	}

	async function finishEditTask(task, text){
		if (text.trim() === task.text) {
			renderTasks();
			return;
		}
		if (text.trim() !== '') {
			task.text = text.trim();
			await saveTaskToServer(task);
			updateStats();
			renderTasks();
			
			updateLocalStorage();
		}
	}

	async function addTaskToServer(task) {
		try {
			await axios.post(tasksURL, task);
        } catch (error) {
            console.error('Ошибка добавления задачи:', error);
        }
	}

	async function saveTaskToServer(task) {
        try {
			await axios.put(`${tasksURL}/${task.id}`, task);
        } catch (error) {
            console.error('Ошибка сохранения задачи:', error);
        }
    }

	async function deleteTaskFromServer(id) {
        try {
            await axios.delete(`${tasksURL}/${id}`);
        } catch (error) {
            console.error('Ошибка удаления задачи:', error);
        }
    }

	async function completeTaskDeletion(id){

		const taskIdx = tasks.findIndex(task => task.id === id);
		if (taskIdx > -1) {
			await deleteTaskFromServer(id);

			tasks.splice(taskIdx, 1);
			updateStats();
			renderTasks();
			updateLocalStorage();
		}

		clearInterval(notificationTimer);
		notificationArea.innerHTML = '';
		pendingDeleteId = null;
	}

	async function updateLocalStorage(){
		const response = await axios.get(tasksURL);
		const fetchedTasks = response.data;
		localStorage.setItem('tasks', JSON.stringify(fetchedTasks));
	}

	function deleteAllTasks(){
		if (!tasks.length){
			deleteAllSwitch.checked = false;
			deleteAllSwitchLabel.classList.add('shake');
			setTimeout(()=>{
				deleteAllSwitchLabel.classList.remove('shake');
			}, 600);
			return;
		} else {
			openModal(confirmDeleteModal);
			setTimeout(()=>{
				deleteAllSwitch.checked = false;
			}, 600);
		}
	}

	async function confirmDeletion() {
		await axios.delete(tasksURL + '/clearTasks');
		tasks = [];
		closeModal(confirmDeleteModal);
		updateStats();
		renderTasks();
		updateLocalStorage();
		showAlert("All tasks are deleted" ,'success');
	}

	/**
	 * @param {number} param - this is simple param.
	*/
	function startTaskDeletion(id){
		if (pendingDeleteId) {
			cancelTaskDeletion(pendingDeleteId);
		}

		pendingDeleteId = id;
		tasksList.querySelector(`[data-id="${id}"]`).style.display = 'none';
		showDeleteNotification(id);
	}

	function cancelTaskDeletion(id){
		tasksList.querySelector(`[data-id="${id}"]`).style.display = 'flex';
		clearInterval(notificationTimer);
		notificationArea.innerHTML = '';
		pendingDeleteId = null;
	}

	function showDeleteNotification(id){
		const task = tasks.find(task => task.id === id);
		if (!task) return;
		
		notificationTimeLeft = 5;
		
		const notification = document.createElement('div');
		notification.className = 'notification';

		notification.innerHTML = `
			<div class="notification-title">
				<span>Cancel deletion?</span>
				<div class="notification-timer">
					<svg class="timer-circle" viewBox="0 0 36 36">
						<circle class="timer-circle-bg" cx="18" cy="18" r="15.9155"></circle>
						<circle class="timer-circle-progress" cx="18" cy="18" r="15.9155" 
								stroke-dasharray="100" stroke-dashoffset="0"></circle>
					</svg>
					<div class="timer-text">5</div>
				</div>
			</div>
			<div class="notification-buttons">
				<button class="notification-btn confirm">Yes</button>
				<button class="notification-btn cancel">No</button>
			</div>
		`;
		
		notificationArea.innerHTML = '';
		notificationArea.appendChild(notification);

		const confirmBtn = notification.querySelector('.confirm');
		const cancelBtn = notification.querySelector('.cancel');
		const timerText = notification.querySelector('.timer-text');
		const progressCircle = notification.querySelector('.timer-circle-progress');

		updateTimerCircle(progressCircle, 0);
    
		confirmBtn.addEventListener('click', () => {
			cancelTaskDeletion(id);
		});

		cancelBtn.addEventListener('click', () => {
			completeTaskDeletion(id);
		});

		notificationTimer = setInterval(() => {
			notificationTimeLeft--;
			timerText.textContent = notificationTimeLeft;
			
			const progress = 100 - ((notificationTimeLeft / 5) * 100);
			updateTimerCircle(progressCircle, progress);
			
			if (notificationTimeLeft <= 0) {
				completeTaskDeletion(id);
			}
		}, 1000);
	}

	function updateTimerCircle(circleElem, percent){
		const circle = 2 * Math.PI * 15.9155;
		const offset = circle - (percent / 100) * circle;
		circleElem.style.strokeDasharray = `${circle} ${circle}`;
		circleElem.style.strokeDashoffset = offset;
	}

	openModalButton.addEventListener("click", () => {
		openModal(addTaskModal);
	});

	closeAddModalButton.addEventListener("click", () => {
		closeModal(addTaskModal);
	})

	closeDeleteModalButton.addEventListener("click", () => {
		closeModal(confirmDeleteModal);
	})

	addTaskButton.addEventListener("click", () => {
		addTask();
	})

	addTaskInput.addEventListener("keypress", (e) => {
		if (e.key === 'Enter') {
			addTask();
		}
	})

	confirmDeleteButton.addEventListener("click", () => {
		confirmDeletion();
	})

	confirmDeleteButton.addEventListener("keypress", (e) => {
		if (e.key === 'Enter') {
			confirmDeletion();
		}
	})

	searchInput.addEventListener("input", ()=>{
		renderTasks();
	})

	sortSelect.addEventListener("change", ()=>{
		renderTasks();
	})

	deleteAllSwitch.addEventListener('change', function(){
		if(this.checked){
			deleteAllTasks();
		}
	});

	addTaskModal.addEventListener('click', (event) => {
		const modalContainer = addTaskModal.querySelector('.modal-container');
		if (!modalContainer.contains(event.target)) {
			closeModal(addTaskModal);
		}
	});
	
	confirmDeleteModal.addEventListener('click', (event) => {
		const modalContainer = confirmDeleteModal.querySelector('.modal-container');
		if (!modalContainer.contains(event.target)) {
			closeModal(confirmDeleteModal);
		}
	});

	function showAlert(message, type) {

		const alert = document.createElement('div');
		alert.className = `alert ${type}`;
		alert.textContent = message;
		document.body.appendChild(alert);

		setTimeout(() => alert.classList.add('show'), 10);

		setTimeout(() => {
			alert.classList.remove('show');

			setTimeout(() => alert.remove(), 500);
		}, 3000);
	}

	function openModal(modal) {
		modal.style.display = 'flex';
	}

	function closeModal(modal) {
		modal.style.display = 'none';
	}
	
	initial();
})