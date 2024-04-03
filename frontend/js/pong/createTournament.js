export async function sendTournamentForm(form) {
    const formData = new FormData(form);
    console.log('Envoi du formulaire :', formData);

    fetch('http://localhost:8080/create_tournament/', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Erreur lors de la requête');
        }
        return response.json();
    })
    .then(function(data) {
        console.log('Réponse de l\'API :', data);
    })
    .catch(function(error) {
        console.error('Erreur:', error);
    });
}