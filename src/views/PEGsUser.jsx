import React from "react";
import { Text } from "@chakra-ui/layout";
import {
    getFirestore, collection, getDocs,
    addDoc, deleteDoc, doc
  } from 'firebase/firestore'
import {db} from "../firebase"
import PEGList from "./PEGList";

const PEGsUser = () => {
    
    const colRef = collection(db, 'PegRequest');

    let pegs = []
    // get collection data
    getDocs(colRef)
    .then(snapshot => {
        // console.log(snapshot.docs)
        snapshot.docs.forEach(doc => {
        pegs.push({ ...doc.data(), id: doc.id })
        })
        console.log(pegs)
    })
    .catch(err => {
        console.log(err.message)
    })

    return( 
        <div>
          { pegs && < PEGList pegs = {pegs} /> }
        </div>
    );

};


export default PEGsUser;
