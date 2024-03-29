/* =================== */
/* GET DATA */
/* =================== */

// Reference : https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON
// Request : https://datarmor.cotesdarmor.fr/datasets/arbres-remarquables-des-cotes-d'armor/api-doc

/*
Call The API an return the remarquable trees of Côtes-d'Armor
*/

async function getTrees() {
    const requestURL =
        "https://datarmor.cotesdarmor.fr/data-fair/api/v1/datasets/arbres-remarquables-des-cotes-d'armor/lines?size=1000&q=typearbre=remarquable"; // Fournir l'url
    const request = new Request(requestURL)

    const response = await fetch(request)
    const respJSON = await response.json() // Fournir la fonction jusque-là ?

    const trees = respJSON.results

    return trees
}

/* The trees from the API */
const TREES = await getTrees()

console.log(TREES)





//Création de la map


let map = L.map('map').setView([48.6, -2.8], 9)

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map)








//Fonction AfficherArbre (Donnée)
function AfficherArbre(TreeId) {

    const treeFocus = document.querySelector(".tree-focus")
    treeFocus.innerHTML = ''
    const nomArbre = document.createElement("h3")
    nomArbre.innerHTML = TREES[TreeId].Essence
    treeFocus.appendChild(nomArbre)

    const nomCommune = document.createElement("h4")
    nomCommune.innerHTML = "à " + TREES[TreeId].Commune
    treeFocus.appendChild(nomCommune)

    if (TREES[TreeId].hasOwnProperty("Dimensioncirconference")) {
        const Circonference = document.createElement("p")
        Circonference.innerHTML = "Circonférence : " + TREES[TreeId].Dimensioncirconference + " m"
        treeFocus.appendChild(Circonference)
    }

    if (TREES[TreeId].hasOwnProperty("dimensionenvergure")) {
        const Envergure = document.createElement("p")
        Envergure.innerHTML = "Envergure : " + TREES[TreeId].dimensionenvergure + " m"
        treeFocus.appendChild(Envergure)
    }
}
let start = Math.floor(Math.random() * 88)
AfficherArbre(start)



//Fonction afficher les marqueurs et les popups

async function AfficherMarker(treeArray, map) {

    treeArray.forEach((tree, index) => {
        var myIcon = L.icon({
            iconUrl: 'images/marker.png'
        })

        if (tree.hasOwnProperty("_geopoint")) {
            let geopoint = tree["_geopoint"].split(',')
            let lat = geopoint[0]
            let lon = geopoint[1]

            let desc = tree["Essence"] + " à " + tree["Commune"]

            if (tree.hasOwnProperty("Dimensioncirconference")) {
                desc += ' <br> Circonférence : ' + tree["Dimensioncirconference"] + " m"
            }

            if (tree.hasOwnProperty("dimensionenvergure")) {
                desc += ' <br> Envergure : ' + tree["dimensionenvergure"] + " m"
            }

            let marker = L.marker([lat, lon], { icon: myIcon }).addTo(map)
            marker.index = index
            marker.addEventListener("click", (e) => {
                AfficherArbre(marker.index)
                marker.bindPopup(desc).openPopup()
            })

        } else {
            console.log("pas de clé '_geopoint' pour cet arbre:", tree)
        }
    })
}

AfficherMarker(TREES, map)


// Fonction permettant d'implémenter les fonctionnalités des boutons flèches
function Bouton(position) {
    const boutonGauche = document.querySelector("#gauche")
    const boutonDroite = document.querySelector("#droite")
    const length = 89
    let index = position

    boutonGauche.addEventListener("click", (event) => {
        if (index === 0) {
            index = length
            AfficherArbre(index)
            console.log(index)
        } else {
            index--
            AfficherArbre(index)
        }
    })

    boutonDroite.addEventListener("click", (event) => {
        if (index === length) {
            index = 0
            AfficherArbre(index)
        } else {
            index++
            AfficherArbre(index)
        }
    })
}
// Appel de la fonction bouton
bouton(start)

// Fonction permettant d'ajouter les différentes essence dans le menu dépliant
function RemplirEssence(treeArray) {
    const selectElement = document.getElementById('essence')


    const essenceSet = new Set()

    treeArray.forEach(tree => {
        essenceSet.add(tree["Essence"])
    })

    essenceSet.forEach(essence => {
        const option = document.createElement('option')
        option.value = essence
        option.textContent = essence
        selectElement.appendChild(option)
    })
}
// Appel de la fonction RemplirEssence
RemplirEssence(TREES)

const selectEssence = document.querySelector("#essence")
selectEssence.addEventListener("change", TrieArbre)

// Fonction permettant de trier les arbres en fonction de leurs essences
function TrieArbre(event) {

    const essenceSelectionnee = event.target.value
    const arbresSelectionnes = TREES.filter(arbre => arbre.Essence === essenceSelectionnee)

    map.eachLayer(layer => {
        if (layer.options.icon && layer.options.icon.options.iconUrl === 'images/marker.png') {
            map.removeLayer(layer)
        }
    })
    arbresSelectionnes.sort((a, b) => a.Essence.localeCompare(b.Essence))
    AfficherMarker(arbresSelectionnes, map)

}

