import "../index.css";

const PEGList = ({pegs}) => {
    return (
        <div>
        {pegs.map(peg => (
          <div className="peg-preview" key={peg.id} >
            <h2>Peg from date { peg.dateOfPeg }</h2>
            <p>Employee: { peg.employeeName }</p>
            <p>Project name: { peg.nameOfProject }</p>
            <p>Evaluation by: { peg.nameOfProjectManager }</p>
            <p>Status: { peg.status }</p>

          </div>
        ))}
      </div>
      );
}

 
export default PEGList;