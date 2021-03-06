import GamerListItem from "./GamerListItem";

import "./GamerList.scss";

const GamerList = (props) => {

  return (
    <section className="gamerList">
      <div className="gamerListDiv">
        {props.users.map((user, i) => ( 
        
          <GamerListItem 
            key={i} 
            avatar={user.image}
            username={user.username}
          /> 
        ))}
      </div>
    </section>
  )
};

export default GamerList;