
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
        console.log("fail")
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
            console.log("success")
            const resData = 'Edit product page';
            window.open(url + id,'_blank', 'width=500px, height=500px')
            console.log("success")
            return Promise.resolve(resData);
        }
        console.log("fail")
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}
