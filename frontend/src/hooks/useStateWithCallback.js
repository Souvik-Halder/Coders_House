import { useCallback, useEffect, useRef, useState } from "react"


export const useStateWithCallBack=(initialState)=>{
    const [state, setState] = useState(initialState);

    const cbRef=useRef();//we are using the useRef() because if the value changes in the component it don't re Render The component so when we don't want to re Render the component we need that

    //here we are using the useCallback because in each render the function in between the useCallback not create newly 
    const updateState=useCallback((newState,cb)=>{
        cbRef.current = cb; //we are storing the function
        setState((prev)=>{
            return typeof newState === 'function'? newState(prev) : newState
            //if anyone passes the function then call the function and return it and otherwise return the newState
        })
    },[]);

    useEffect(()=>{
        if(cbRef.current){

            cbRef.current(state);
            cbRef.current=null;
        }
        //here we are calling the function previously stored in the cbRef
    },[state])

    return [state,updateState];
}


