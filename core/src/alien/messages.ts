
class _DiedMessages
{
	public default: string = "Oops, you died...";
	
	public quickSand: string = 
		"Push the rock by pressing [p] in the quicksand, so you can walk over it.";
	
	public greenWorm: string = 
		"Jump over the worm. To jump higher you have to press [↑] while jumping.";
	
	public redWorm: string = 
		"Jump over the worm. To do so, first make a platform by jumping where " +
        "the symbol [0x2161] is. Then jump on top of the platform and from " +
        "there over the worm. To jump higher you have to press [↑] while jumping";
      
	// Water without waves
	public waterNoWaves: string =  
        "Walk over the water. Walk fast without stopping.";
      
    // Water with huge waves
	public waterHugeWaves: string =
		"Invert gravity to cross the water, so you can walk in the clouds. " +
        "Press [↑] and [↓] to invert the gravity.";
  
    // Bees
	public bee: string =
        "Press ↑ to fly.";
     
	// Flies
    public fly: string =
        "Press ↑ to fly. Before the flies kill you, you have to kill them " +
        "by falling on top of them while flying.";
	
	// Ice
	public ice: string = "Press ↓ to not slip in the ice";
	
	// Lever
	public lever: string =
		"Open the door, when you cross it you will be teleported to the other " + 
        "one. To open the door, you need to put the levers in the following " +
        "combination: [0x0706] [0x0704]. You can move the levers by pressing " +
        "[p] when you are next to them.";		
}

var DiedMessages = new _DiedMessages();
