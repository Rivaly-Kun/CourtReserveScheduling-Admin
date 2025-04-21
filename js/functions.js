const contentTitle = document.getElementById('content-title');
const dashboardLink = document.getElementById('dashboard-link');
const analyticsLink = document.getElementById('analytics-link');
const membersLink = document.getElementById('members-link');
const scannerlink = document.getElementById('scanner-link');
const asstitantlink = document.getElementById('asstitant-link');
const postlink = document.getElementById('post-link');


const Bread = document.getElementById('BreadcrumName');

function showContent(contentId, title) {
    contentTitle.textContent = title;

    document.getElementById('dashboard-content').style.display = 'none';
    document.getElementById('all-members-content').style.display = 'none';
    document.getElementById('analytics-content').style.display = 'none';
    document.getElementById('post-content').style.display = 'none';
  
    document.getElementById('asstitant-content').style.display = 'none';

    document.getElementById(contentId).style.display = 'block';
}



dashboardLink.addEventListener('click', () => {
    showContent('dashboard-content', 'Home');
    Bread.textContent = 'Home'; 
});

analyticsLink.addEventListener('click', () => {
    showContent('analytics-content', 'Users');
    Bread.textContent = 'Users'; 
});
postlink.addEventListener('click', () => {
    showContent('post-content', 'Booking');
    Bread.textContent = 'Booking'; 
});
membersLink.addEventListener('click', () => {
    showContent('all-members-content', 'Logs');
    Bread.textContent = 'Logs'; 
});
asstitantlink.addEventListener('click', () => {
    showContent('asstitant-content', 'Courts');
    Bread.textContent = 'Courts'; 
});

