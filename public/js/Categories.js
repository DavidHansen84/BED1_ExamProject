async function deleteCategory(id) {
    let errorData = "Something went wrong"
    try{
    let url = 'http://localhost:3000/categories/delete/'
        const response = await fetch(url + id, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    })
    if (response.ok) {
        const resData = "Category deleted"
        location.reload()
        return Promise.resolve(resData);
    } 
    if (!response.ok) {
    errorData = await response.json();
    alert(errorData.error)
    return Promise.reject(errorData);
} 
} catch(err) {
    
alert(errorData);
}
};

async function editCategory(id, Name) {
    let url = 'http://localhost:3000/categories/change/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edited category';
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
    let url = 'http://localhost:3000/admin/editcategory/'
    console.log(url)
        await fetch(url + id, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edit category page';
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
    let url = 'http://localhost:3000/admin/addCategory'
        await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Add category page';
            window.open(url,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        alert(response.statusText);
      });;
}

async function addCategory(Name) {
    let url = 'http://localhost:3000/categories/add/'
        await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Added category';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });
}