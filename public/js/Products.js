
async function deleteProduct(id) {
    let url = 'http://localhost:3000/products/delete/'
        await fetch(url + id, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Deleted product';
            location.reload()
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function activateProduct(id) {
    let url = 'http://localhost:3000/products/activate/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Activated product';
            location.reload()
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editProduct(id, Name, ImageURL, Description, Price, Quantity, Brand, Category) {
    let url = 'http://localhost:3000/products/edit/'
    console.log(url)
    console.log(id)
    console.log(Name, ImageURL, Description, Price, Quantity, Brand, Category)
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name, 
            ImageURL: ImageURL, 
            Description: Description, 
            Price: Price, 
            Quantity: Quantity, 
            Brand: Brand, 
            Category: Category
        })
    }).then((response) => {
        if (response.ok) {
            console.log("success")
            const resData = 'Edited product';
            window.close();
            console.log("success")
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
    let url = 'http://localhost:3000/admin/editProducts/'
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
