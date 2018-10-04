# pxt-kitronik-robotics-board

Custom blocks for www.kitronik.co.uk/5641 All-in-one Robotics Board for micro:bit

## Motors

This package contains a block for driving standard motors forwards and backwards, with a speed setting of 0-100%:
```blocks
Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor3, Kitronik_Robotics_Board.MotorDirection.Forward, 10)
Kitronik_Robotics_Board.motorOn(Kitronik_Robotics_Board.Motors.Motor4, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
```
There are also blocks for driving stepper motors forwards and backwards by either a set number of steps, or to an angle relative to the start position:
```blocks
Kitronik_Robotics_Board.stepperMotorTurnAngle(Kitronik_Robotics_Board.StepperMotors.Stepper1, Kitronik_Robotics_Board.MotorDirection.Forward, 180)
Kitronik_Robotics_Board.stepperMotorTurnSteps(Kitronik_Robotics_Board.StepperMotors.Stepper1, Kitronik_Robotics_Board.MotorDirection.Reverse, 100)
```
Individual motor outputs can also be turned off.
```blocks
Kitronik_Robotics_Board.motorOff(Kitronik_Robotics_Board.Motors.Motor3)
```

## Servos

This package contains a block for driving both 180 and continuous rotation servos, with the ability to set the drive angle between 0 and 180 degrees:
```blocks
Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo4, 180)
Kitronik_Robotics_Board.servoWrite(Kitronik_Robotics_Board.Servos.Servo5, 0)
```
(Note: For continuous rotation servos, setting the drive angle to 0 will turn the servo at max speed in one direction, and setting it to 180 will turn it at max speed in the other direction)

## Settings

This package contains a block for setting how many steps there are in a full rotation stepper motors being used:
```blocks
Kitronik_Robotics_Board.setStepperMotorSteps(Kitronik_Robotics_Board.StepperMotors.Stepper1, 200)
```
(Note: The default value for both Stepper 1 and 2 is 200 as this is the msot common number of steps in a full rotation)

## Other

This package also contains an 'emergency stop' block which turns off all motor and all servo outputs at the same time:
```blocks
Kitronik_Robotics_Board.allOff()
```

## License

MIT

## Supported Targets

* for PXT/microbit
(The metadata above is needed for package search.)
