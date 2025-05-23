// nuxt3-app/server/api/users.get.js
let usersCache = null;

async function fetchUsersFromReqres() {
  try {
    const responsePage1 = await $fetch('https://reqres.in/api/users?page=1');
    const responsePage2 = await $fetch('https://reqres.in/api/users?page=2');
    // Combine data from both pages
    let combinedData = [];
    if (responsePage1 && responsePage1.data) {
      combinedData = combinedData.concat(responsePage1.data);
    }
    if (responsePage2 && responsePage2.data) {
      combinedData = combinedData.concat(responsePage2.data);
    }
    return combinedData.map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      avatar: user.avatar,
    }));
  } catch (error) {
    console.error('Error fetching users from reqres.in:', error);
    // Return a default list or an empty list in case of an error
    return [
      { id: 1, email: 'george.bluth@reqres.in', first_name: 'George', last_name: 'Bluth', avatar: 'https://reqres.in/img/faces/1-image.jpg' },
      { id: 2, email: 'janet.weaver@reqres.in', first_name: 'Janet', last_name: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' },
    ];
  }
}

export default defineEventHandler(async (event) => {
  if (!usersCache) {
    usersCache = await fetchUsersFromReqres();
  }
  return {
    data: usersCache
  };
});
