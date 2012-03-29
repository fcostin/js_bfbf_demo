var OP_INCREMENT = '+';
var OP_DECREMENT = '-';
var OP_LEFT = '<';
var OP_RIGHT = '>';
var OP_BEGIN_LOOP = '[';
var OP_END_LOOP = ']';
var OP_GET = ',';
var OP_PUT = '.';
var OP_STOP = 0;
var BAD_JUMP = -1;

function preprocess(code) {
    var ops, jumps, jump_stack, i, c, jump, j, program;

    ops = [];
    jumps = [];
    jump_stack = [];

    for (i = 0; i < code.length; ++i) {
        c = code[i];
        ops.push(c);
        if (c === OP_BEGIN_LOOP) {
            jump_stack.push(i);
            jumps.push(BAD_JUMP);
        } else if (c === OP_END_LOOP) {
            j = jump_stack.pop();
            jumps.push(j);
            jumps[j] = i;
        } else {
            jumps.push(BAD_JUMP);
        }
    }
    ops.push(OP_STOP);
    jumps.push(BAD_JUMP);
    program = {
        'ops' : ops,
        'jumps' : jumps
    };
    return program;
}

function bf_interp(stdin, stdout, machine_status, program) {
    // input handling
    var input_size = stdin.value.length;
    var ip = 0;
    function get_char() {
        if (ip < input_size) {
            return stdin.value.charCodeAt(ip++);
        } else {
            return 0;
        }
    }
    stdout.value = "";
    machine_status.value = "RUNNING; steps_elapsed: 0";
    // output handling
    var put_buffer = "";
    function put_char(c) {
        put_buffer = put_buffer + String.fromCharCode(c);
    }
    function flush_put_buffer() {
        stdout.value = stdout.value + put_buffer;
        // scroll text area
        stdout.scrollTop = stdout.scrollHeight;
        // clear put buffer
        put_buffer = "";
    }
    // init bf machine
    var buff_size = 30000;
    var buff = new Array(buff_size);
    for (i = 0; i < buff_size; i++) {
        buff[i] = 0;
    }
    var dp = 0;
    var pc = 0;

    var steps_elapsed = 0;
    var net_steps_elapsed = 0;
    var steps_per_chunk = 1000000;
    var delay_after_chunk = 0;
    var running = true;

    function interpret_chunk() {
        steps_elapsed = 0;
        while (running && (steps_elapsed < steps_per_chunk)) {
            switch(program.ops[pc]) {
                case OP_INCREMENT:
                    buff[dp] = (buff[dp] + 1) % 256;
                    break;
                case OP_DECREMENT:
                    buff[dp] = (buff[dp] - 1) % 256;
                    break;
                case OP_LEFT:
                    dp--;
                    break;
                case OP_RIGHT:
                    dp++;
                    break;
                case OP_BEGIN_LOOP:
                    if (buff[dp] === 0) {
                        pc = program.jumps[pc];
                    }
                    break;
                case OP_END_LOOP:
                    if (buff[dp] !== 0) {
                        pc = program.jumps[pc];
                    }
                    break;
                case OP_PUT:
                    put_char(buff[dp]);
                    break;
                case OP_GET:
                    buff[dp] = get_char();
                    break;
                case OP_STOP:
                    running = false;
                    break
                default:
            }
            pc++;
            steps_elapsed++;
        }
        flush_put_buffer();
        net_steps_elapsed += steps_elapsed
        machine_status.value = "RUNNING; steps_elapsed: " + net_steps_elapsed.toString();
        if (running) {
            setTimeout(interpret_chunk, delay_after_chunk);
        } else {
            machine_status.value = "FINISHED; steps_elapsed: " + net_steps_elapsed.toString();
        }
    }

    interpret_chunk();
}
