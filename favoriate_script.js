const BASED_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASED_URL + "api/v1/users/";

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchSubmit = document.querySelector("#search-submit");

const gender = document.querySelector("#gender");
const region = document.querySelector("#region");

const dataPanel = document.querySelector("#data-panel");

const modalName = document.querySelector("#user-modal-name");
const modalEmail = document.querySelector("#user-modal-email");
const modalGender = document.querySelector("#user-modal-gender");
const modalAge = document.querySelector("#user-modal-age");
const modalRegion = document.querySelector("#user-modal-region");
const modalBirthday = document.querySelector("#user-modal-birthday");
const modalAvatar = document.querySelector("#user-modal-avatar");

const paginator = document.querySelector("#paginator");

const localStorageItem = "favoriteFriends"
const USER_PER_PAGE = 12;

const userList = [];
let filteredUserList = [];
let currentPage = 1;
let currentRegion = "";
let currentGender = "";
let currentKW = "";

function setFavorateList() {
  userList.length = 0
  userList.push(...JSON.parse(localStorage.getItem(localStorageItem)) || [])
}
setFavorateList()
initRegionDropList();
renderPage();

function initRegionDropList() {
  let regionList = userList.map((user) => user.region);
  regionList = [...new Set(regionList)];
  regionList.splice(0, 0, "ALL");
  renderRegionDropDown(regionList);
}

function renderRegionDropDown(regionList) {
  region.innerHTML = regionList
    .map(
      (region) =>
        `<li><a href="javascript:;"  data-region="${region}">${region}</a></li>`
    )
    .join("\n");
}

function getCurrentUserList() {
  if (filteredUserList.length) {
    return filteredUserList;
  }

  if (userList.length) {
    return userList;
  }

  return [];
}

function renderPage() {
  const currentUserList = getCurrentUsersByPage(currentPage);
  renderUserList(currentUserList);
  renderPaginator();
}

function renderPaginator() {
  const currentUserList = getCurrentUserList();
  const numberOfPages = Math.ceil(currentUserList.length / USER_PER_PAGE);

  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="javascript:;" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getCurrentUsersByPage(page) {
  const currentUserList = getCurrentUserList();
  const startIndex = (page - 1) * USER_PER_PAGE;
  return currentUserList.slice(startIndex, startIndex + USER_PER_PAGE);
}

function renderUserList(userList) {
  let htmlContent = userList
    .map(
      (user) =>
        `<div class="col-sm-3">
        <div class="card>
          <a href="#" data-toggle="modal" data-target="#user-modal" >
            <img class="card-img-top" src="${
              user.avatar
            }" alt="User Poster" data-id="${user.id}">
          </a>
          <div class="card-body d-flex justify-content-around">
<a  href="javascript:;" data-id="${
          user.id
        }"><i class="fa fa-heart fa-1x" id="heartstyle" data- aria-hidden="true"></i></a>
<p class="card-title" style="font-size:14px">${
          user.name + " " + user.surname
        }</p>
          </div>
        </div>
      </div>`
    )
    .join("\n");

  dataPanel.innerHTML = htmlContent;
}

function updateUserModal(id) {
  console.log("updateUserModal", id);
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      modalName.innerHTML = response.data.name + " " + response.data.surname;
      modalEmail.innerHTML = response.data.email;
      modalGender.innerHTML = response.data.gender;
      modalAge.innerHTML = response.data.age;
      modalRegion.innerHTML = response.data.region;
      modalBirthday.innerHTML = response.data.birthday;
      modalAvatar.innerHTML = `<img
                src="${response.data.avatar}"
                alt="user-poster" class="img-fluid" width="500" height="600"/>`;
    })
    .catch((error) => console.log(error));
}

function setFilterList() {
  console.log(
    "current: [" +
      currentKW +
      "] [" +
      currentGender +
      "] [" +
      currentRegion +
      "]"
  );
  let currentUserList = userList;

  if (currentKW !== "") {
    currentUserList = currentUserList.filter(
      (user) =>
        user.name.toLowerCase().includes(currentKW) ||
        user.surname.toLowerCase().includes(currentKW)
    );
  }

  if (currentRegion !== "") {
    currentUserList = currentUserList.filter(
      (user) => user.region === currentRegion
    );
  }

  if (currentGender !== "") {
    currentUserList = currentUserList.filter(
      (user) => user.gender === currentGender
    );
  }

  filteredUserList = currentUserList;
}

function subFavoriteItem(id) {
  let userList = JSON.parse(localStorage.getItem(localStorageItem)) || [];
  userList = userList.filter(user => user.id !== Number( id))
  localStorage.setItem(localStorageItem, JSON.stringify(userList));
}

// listen event define

region.addEventListener("click", function onRegionClicked(event) {
  if (event.target.tagName !== "A") return;

  // const currentUserList = getCurrentUserList();
  const region = event.target.dataset.region;
  currentRegion = region === "all" ? "" : region;

  setFilterList();
  renderPage();
});

gender.addEventListener("click", function onGenderClicked(event) {
  if (event.target.tagName !== "BUTTON") return;

  const gender = event.target.dataset.gender;
  currentGender = gender === "all" ? "" : gender;
  // const currentUserList = getCurrentUserList();

  setFilterList();
  renderPage();
});

dataPanel.addEventListener("click", function onUserModalClicked(event) {
  const tagName = event.target.tagName;
  if (tagName === "IMG") {
    updateUserModal(event.target.dataset.id);
  } else if (tagName === "I") {
    subFavoriteItem(event.target.parentElement.dataset.id);
    setFavorateList()
    renderPage();
    event.stopPropagation();
  } else {
    event.stopPropagation();
  }
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  currentPage = Number(event.target.dataset.page);
  renderPage();
});

searchForm.addEventListener("submit", function onSearchFormSubmtted(event) {
  event.preventDefault();
  currentKW = searchInput.value.trim().toLowerCase();

  setFilterList();

  currentPage = 1;
  renderPage();
});