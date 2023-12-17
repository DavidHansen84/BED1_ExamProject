async function editUser(id, email, firstName, lastName, role, username, telephoneNumber) {
    let url = 'http://localhost:3000/users/edit/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            email: email, 
            firstName: firstName, 
            lastName: lastName, 
            role: role, 
            username: username, 
            telephoneNumber: telephoneNumber
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edited user';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editButton(id) {
    let url = 'http://localhost:3000/admin/editUser/'
    console.log(url)
        await fetch(url + id, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edit product page';
            window.open(url + id,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function addButton() {
    let url = 'http://localhost:3000/admin/addUser'
        await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Add user page';
            window.open(url,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        alert(response.statusText);
      });;
}

async function addUser(Username, Password, Email, FirstName, LastName, Address, Telephone) {
    try{
        let url = 'http://localhost:3000/auth/register/'
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Username: Username, 
            Password: Password, 
            Email: Email, 
            FirstName: FirstName, 
            LastName: LastName, 
            Address: Address, 
            Telephone: Telephone
        })
    })
        if (response.ok) {
            const resData = "User added"
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        } else {
        const errorData = await response.json();
        alert(errorData.error)
        return Promise.reject(errorData);
    } 
} catch(err) {
        
    alert(errorData.error);
  }
};

async function deleteButton(email, username) {
    try{
        let url = 'http://localhost:3000/auth/delete/'
        const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            email: email, 
        })
    })
        if (response.ok) {
            const resData = "User deleted"
            location.reload()
            return Promise.resolve(resData);
        } else {
        errorData = await response.json();
        alert(errorData.error)
        return Promise.reject(errorData);
    } 
} catch(err) {
        
    alert(errorData.error);
  }
}