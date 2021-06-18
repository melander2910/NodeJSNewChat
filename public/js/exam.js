fetch("/rooms")
    .then(rooms => rooms.json())
    .then(data => console.log(data))
    